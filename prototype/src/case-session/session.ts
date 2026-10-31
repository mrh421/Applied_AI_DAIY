import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { SAFETY_RULES_VERSION } from "../case-model";
import type {
  Answer,
  CaseOutcome,
  CaseRequest,
  ExplainOutcome,
  Money,
  Quantity,
  SolutionOption,
  StepAnswerOutcome,
  UserNotice,
  WorkPackage,
} from "../case-model";
import { answerStepQuestion, assessCase, explainSteps } from "../case-pipeline";
import { precheck } from "../hazard-precheck";
import { getCase, getPhoto, saveCase, savePhoto } from "../history";
import type { CaseRecord } from "../history";
import { deduct, listMaterials, saveMaterial, snapshot } from "../inventory";
import { StorageFullError } from "../local-store";
import { levelFor } from "../profile";
import { downscalePhoto, toPhotoInput } from "./photo";
import { prefillQuestions } from "./prefill";

export type CaseSession = {
  record: CaseRecord;
  photo: Blob | null;
  pending: "assess" | "explain" | "question" | null;
  staleRules: boolean;
};

type Used = { name: string; quantity: Quantity; inventoryItemId?: string };

// The open sessions live outside any component, so a session survives a change of route (GO-BACK).
const open = new Map<string, CaseSession>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish(id: string, session: CaseSession): void {
  open.set(id, session);
  listeners.forEach((l) => l());
}

// A stored record under older safety rules is re-checked by the pre-check (ARC-002).
function openRecord(id: string): CaseSession | null {
  const cached = open.get(id);
  if (cached) return cached;
  const stored = getCase(id);
  if (!stored) return null;
  const staleRules = stored.rulesVersion !== SAFETY_RULES_VERSION;
  let record = stored;
  if (staleRules) {
    const escalation = precheck([stored.description, ...stored.answers.map((a) => a.text)]);
    if (escalation) record = { ...stored, outcome: { type: "escalation", escalation } };
  }
  const session: CaseSession = { record, photo: null, pending: null, staleRules };
  open.set(id, session);
  return session;
}

function current(id: string): CaseSession {
  const s = open.get(id);
  if (!s) throw new Error(`case ${id} is not open`);
  return s;
}

// Saves the changed record first; a StorageFullError leaves the open session as it was.
function change(id: string, fn: (r: CaseRecord) => CaseRecord, extra?: Partial<CaseSession>): void {
  const s = current(id);
  const record = fn(s.record);
  saveCase(record);
  publish(id, { ...s, ...extra, record });
}

function setPending(id: string, pending: CaseSession["pending"]): void {
  publish(id, { ...current(id), pending });
}

const NOTICES: Record<"offline" | "technical-error", UserNotice> = {
  offline: {
    reason: "offline",
    text: "You seem to be offline. Your case is saved. Try again when you are connected.",
    missing: [],
  },
  "technical-error": {
    reason: "technical-error",
    text: "Something went wrong on our side. Your case is saved. Please try again.",
    missing: [],
  },
};

function noticeFor(e: unknown): UserNotice {
  return e instanceof TypeError ? NOTICES.offline : NOTICES["technical-error"];
}

// A rejected server call becomes a notice outcome; it never throws.
async function call<T extends { type: string }>(
  fn: () => Promise<T>,
): Promise<T | { type: "notice"; notice: UserNotice }> {
  try {
    return await fn();
  } catch (e) {
    return { type: "notice", notice: noticeFor(e) };
  }
}

function findPackage(record: CaseRecord, packageId: string): WorkPackage | undefined {
  if (record.outcome?.type !== "guidance") return undefined;
  return record.outcome.options.flatMap((o) => o.packages).find((p) => p.id === packageId);
}

function explainRequest(pkg: WorkPackage, onlyStep: number | null, simpler: boolean) {
  const steps = (pkg.guide?.steps ?? []).map((s) => ({ n: s.n, text: s.text }));
  return {
    packageId: pkg.id,
    area: pkg.area,
    level: levelFor(pkg.area),
    steps: onlyStep === null ? steps : steps.filter((s) => s.n === onlyStep),
    onlyStep,
    simpler,
  };
}

function storeExplanation(id: string, out: ExplainOutcome): void {
  if (out.type !== "explanation") return;
  change(id, (r) => ({
    ...r,
    explanations: {
      ...r.explanations,
      [out.packageId]: {
        ...r.explanations[out.packageId],
        ...Object.fromEntries(out.steps.map((s) => [s.n, s.basics])),
      },
    },
  }));
}

// Sends the case as it stands. A questions outcome advances the round, is prefilled by topic and
// loses the questions the user already answered "not sure"; if none is left, the case goes on.
async function assess(id: string): Promise<CaseOutcome> {
  setPending(id, "assess");
  try {
    for (let guard = 0; ; guard++) {
      const { record, photo } = current(id);
      const req: CaseRequest = {
        description: record.description,
        ...(photo ? { photo: await toPhotoInput(photo) } : {}),
        answers: record.answers,
        round: record.round,
        inventory: snapshot(),
      };
      let outcome = await call(() => assessCase({ data: req }));
      if (outcome.type === "notice") return outcome;
      if (outcome.type === "questions") {
        const unsure = new Set(record.answers.filter((a) => a.notSure).map((a) => a.topic));
        const questions = prefillQuestions(
          outcome.questions.filter((q) => !unsure.has(q.topic)),
          record.answers,
        );
        outcome = { ...outcome, questions };
        const round = outcome.round;
        change(id, (r) => ({ ...r, outcome, round, rulesVersion: SAFETY_RULES_VERSION }));
        if (questions.length === 0 && guard < 2) continue;
        return outcome;
      }
      change(id, (r) => ({ ...r, outcome, rulesVersion: SAFETY_RULES_VERSION }));
      return outcome;
    }
  } finally {
    setPending(id, null);
  }
}

export function useCaseSession(caseId?: string) {
  const [id, setId] = useState<string | undefined>(caseId);
  const session = useSyncExternalStore(
    subscribe,
    () => (id ? openRecord(id) : null),
    () => null,
  );

  const hadPhoto = session?.record.hadPhoto;
  const hasPhoto = session?.photo != null;
  useEffect(() => {
    if (!id || !hadPhoto || hasPhoto) return;
    void getPhoto(id).then((photo) => {
      if (photo && !current(id).photo) publish(id, { ...current(id), photo });
    });
  }, [id, hadPhoto, hasPhoto]);

  const need = (): string => {
    if (!id) throw new Error("no open case");
    return id;
  };

  const start = useCallback(
    async (input: { description: string; photo?: File }): Promise<CaseOutcome> => {
      const newId = crypto.randomUUID();
      const photo = input.photo ? await downscalePhoto(input.photo) : null;
      const record: CaseRecord = {
        id: newId,
        createdAt: new Date().toISOString(),
        rulesVersion: SAFETY_RULES_VERSION,
        chosenOffers: {},
        status: "ongoing",
        description: input.description,
        hadPhoto: photo !== null,
        answers: [],
        round: 0,
        outcome: null,
        chosenOptionId: null,
        explanations: {},
        checked: {},
        notes: "",
        budget: null,
        materialsUsed: [],
      };
      saveCase(record);
      publish(newId, { record, photo, pending: null, staleRules: false });
      setId(newId);
      if (photo) await savePhoto(newId, photo);
      return assess(newId);
    },
    [],
  );

  const answer = useCallback(
    (answers: Answer[]): Promise<CaseOutcome> => {
      const caseKey = need();
      const ids = new Set(answers.map((a) => a.questionId));
      change(caseKey, (r) => ({
        ...r,
        answers: [...r.answers.filter((a) => !ids.has(a.questionId)), ...answers],
      }));
      return assess(caseKey);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const reassess = useCallback(async (): Promise<CaseOutcome> => {
    const caseKey = need();
    const outcome = await assess(caseKey);
    if (outcome.type !== "notice") publish(caseKey, { ...current(caseKey), staleRules: false });
    return outcome;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const explainPackages = async (caseKey: string, packages: WorkPackage[]) => {
    setPending(caseKey, "explain");
    try {
      for (const pkg of packages) {
        storeExplanation(
          caseKey,
          await call(() => explainSteps({ data: explainRequest(pkg, null, false) })),
        );
      }
    } finally {
      setPending(caseKey, null);
    }
  };

  const chooseOption = useCallback(
    async (optionId: string): Promise<void> => {
      const caseKey = need();
      change(caseKey, (r) => ({ ...r, chosenOptionId: optionId }));
      const outcome = current(caseKey).record.outcome;
      const option: SolutionOption | undefined =
        outcome?.type === "guidance" ? outcome.options.find((o) => o.id === optionId) : undefined;
      await explainPackages(
        caseKey,
        (option?.packages ?? []).filter((p) => p.guide && p.label === "diy"),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const reExplain = useCallback(
    async (packageId: string, n: number): Promise<ExplainOutcome> => {
      const caseKey = need();
      const pkg = findPackage(current(caseKey).record, packageId);
      if (!pkg) return { type: "notice", notice: NOTICES["technical-error"] };
      setPending(caseKey, "explain");
      try {
        const out = await call(() => explainSteps({ data: explainRequest(pkg, n, true) }));
        storeExplanation(caseKey, out);
        return out;
      } finally {
        setPending(caseKey, null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const askStep = useCallback(
    async (packageId: string, n: number, question: string): Promise<StepAnswerOutcome> => {
      const caseKey = need();
      const { record } = current(caseKey);
      const pkg = findPackage(record, packageId);
      if (!pkg || record.outcome?.type !== "guidance") {
        return { type: "notice", notice: NOTICES["technical-error"] };
      }
      const summary = record.outcome.summary;
      setPending(caseKey, "question");
      try {
        return await call(() =>
          answerStepQuestion({ data: { summary, pkg, currentStep: n, question } }),
        );
      } finally {
        setPending(caseKey, null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const checkStep = useCallback(
    (packageId: string, n: number, done: boolean): void => {
      change(need(), (r) => {
        const rest = (r.checked[packageId] ?? []).filter((x) => x !== n);
        const steps = (done ? [...rest, n] : rest).sort((a, b) => a - b);
        return { ...r, checked: { ...r.checked, [packageId]: steps } };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const setNotes = useCallback(
    (notes: string): void => change(need(), (r) => ({ ...r, notes })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const setBudget = useCallback(
    (budget: Money | null): void => change(need(), (r) => ({ ...r, budget })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const setChosenOffer = useCallback(
    (itemId: string, offerId: string | null): void => {
      change(need(), (r) => {
        const { [itemId]: _dropped, ...rest } = r.chosenOffers;
        return { ...r, chosenOffers: offerId === null ? rest : { ...rest, [itemId]: offerId } };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  // Deduction, materialsUsed and status belong together: if the record cannot be saved, the
  // deducted quantities are put back, so inventory and record never disagree (UC-015).
  const complete = useCallback(
    (used: Used[]): { ok: true } | { ok: false; reason: "storage-full" } => {
      const caseKey = need();
      const before = listMaterials();
      try {
        deduct(
          used.flatMap((u) =>
            u.inventoryItemId ? [{ itemId: u.inventoryItemId, amount: u.quantity.amount }] : [],
          ),
        );
        change(caseKey, (r) => ({ ...r, status: "completed", materialsUsed: used }));
        return { ok: true };
      } catch (e) {
        if (!(e instanceof StorageFullError)) throw e;
        for (const m of before) {
          try {
            saveMaterial(
              {
                name: m.name,
                amount: m.quantity.amount,
                unit: m.quantity.unit,
                ...(m.location === undefined ? {} : { location: m.location }),
              },
              m.id,
            );
          } catch {
            // The store is full: the rest of the undo cannot be written either.
          }
        }
        return { ok: false, reason: "storage-full" };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  return {
    session,
    start,
    answer,
    chooseOption,
    reExplain,
    askStep,
    checkStep,
    setNotes,
    setBudget,
    reassess,
    setChosenOffer,
    complete,
  };
}
