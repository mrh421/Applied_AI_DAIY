import { draftAssessment } from "../ai-tasks";
import { rankOptions, schemas } from "../case-model";
import type { CaseOutcome } from "../case-model";
import { detectLanguage, precheck } from "../hazard-precheck";
import { noticesFor } from "../legal-notices";
import { checkAssessmentDraft } from "../output-check";
import { enforceSafety } from "../safety-enforcement";
import { logOutcome } from "./log";
import { INVALID_REQUEST_NOTICE, OUTPUT_REJECTED_NOTICE, technicalErrorNotice } from "./notices";

// The pipe of an assessment: pre-check, AI draft, output check, enforcement, finishing.
async function pipe(input: unknown): Promise<{ outcome: CaseOutcome; failures: string[] }> {
  const parsed = schemas.caseRequest.safeParse(input);
  if (!parsed.success) {
    return { outcome: { type: "notice", notice: INVALID_REQUEST_NOTICE }, failures: [] };
  }
  const req = parsed.data;

  const escalation = precheck([req.description, ...req.answers.map((a) => a.text)]);
  if (escalation) return { outcome: { type: "escalation", escalation }, failures: [] };

  let raw: unknown;
  try {
    raw = await draftAssessment(req);
  } catch (e) {
    return { outcome: { type: "notice", notice: technicalErrorNotice(e) }, failures: [] };
  }

  const checked = checkAssessmentDraft(raw, { round: req.round });
  const language = detectLanguage([req.description, ...req.answers.map((a) => a.text)]);
  const ctx = { round: req.round, answers: req.answers, language };
  let draft;
  if (checked.ok) {
    draft = checked.value;
  } else {
    const failures = checked.failures.map((f) => f.check);
    // A draft of high risk that passed the format goes to enforcement, so the user gets the
    // escalation and not only a notice to retry.
    const readable = failures.includes("format") ? null : schemas.assessmentDraft.safeParse(raw);
    if (readable?.success && (readable.data.risk === "high" || readable.data.risk === "critical")) {
      return { outcome: enforceSafety(readable.data, ctx), failures };
    }
    return { outcome: { type: "notice", notice: OUTPUT_REJECTED_NOTICE }, failures };
  }

  const outcome = enforceSafety(draft, ctx);
  if (outcome.type !== "guidance") return { outcome, failures: [] };
  return {
    outcome: {
      ...outcome,
      options: uniqueIds(rankOptions(outcome.options)),
      notices: noticesFor(draft.notices),
    },
    failures: [],
  };
}

const SAFE_ID = /^[A-Za-z0-9_-]+$/;

/**
 * The model chooses the ids of options and packages. The screens find a package by its id (the route
 * `/case/$id/work/$packageId`, the check-off, the explanations), so an id used twice or with a character
 * that does not belong in a path would open the wrong package or none. Such ids are replaced.
 */
export function uniqueIds<T extends { id: string; packages: { id: string }[] }>(options: T[]): T[] {
  const seenOptions = new Set<string>();
  const seenPackages = new Set<string>();
  const fresh = (wanted: string, fallback: string, seen: Set<string>): string => {
    let id = SAFE_ID.test(wanted) && !seen.has(wanted) ? wanted : fallback;
    for (let n = 2; seen.has(id); n++) id = `${fallback}-${n}`;
    seen.add(id);
    return id;
  };
  return options.map((o, i) => {
    const optionId = fresh(o.id, `option-${i + 1}`, seenOptions);
    return {
      ...o,
      id: optionId,
      packages: o.packages.map((p, j) => ({
        ...p,
        id: fresh(p.id, `${optionId}-package-${j + 1}`, seenPackages),
      })),
    };
  });
}

export async function runAssess(input: unknown): Promise<CaseOutcome> {
  const { outcome, failures } = await pipe(input);
  logOutcome("assess", outcome.type, failures);
  return outcome;
}
