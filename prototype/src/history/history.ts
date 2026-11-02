import { useSyncExternalStore } from "react";

import type { Answer, CaseOutcome, Money, Quantity } from "../case-model";
import { hasConsent } from "../consent";
import { localStore } from "../local-store";

export type CaseRecord = {
  id: string;
  createdAt: string;
  rulesVersion: string;
  chosenOffers: Record<string, string>;
  status: "ongoing" | "completed";
  description: string;
  hadPhoto: boolean;
  /** How many photos the case had; absent in a case stored before several photos (then 1 if hadPhoto). */
  photoCount?: number;
  answers: Answer[];
  round: 0 | 1 | 2;
  outcome: CaseOutcome | null;
  chosenOptionId: string | null;
  explanations: Record<string, Record<number, string>>;
  checked: Record<string, number[]>;
  notes: string;
  budget: Money | null;
  materialsUsed: { name: string; quantity: Quantity; inventoryItemId?: string }[];
};

/**
 * A stored case as the screens expect it. A record written by an earlier version may lack fields that
 * were added later (offers, explanations, notices, assumptions, ...); each missing field gets its empty
 * value, so opening an old case never takes a page down.
 */
export function normalizeCase(stored: CaseRecord): CaseRecord {
  const outcome = stored.outcome;
  return {
    ...stored,
    photoCount: stored.photoCount ?? (stored.hadPhoto ? 1 : 0),
    answers: stored.answers ?? [],
    round: stored.round ?? 0,
    chosenOptionId: stored.chosenOptionId ?? null,
    chosenOffers: stored.chosenOffers ?? {},
    explanations: stored.explanations ?? {},
    checked: stored.checked ?? {},
    notes: stored.notes ?? "",
    budget: stored.budget ?? null,
    materialsUsed: stored.materialsUsed ?? [],
    outcome:
      outcome?.type === "guidance"
        ? {
            ...outcome,
            assumptions: outcome.assumptions ?? [],
            notices: outcome.notices ?? [],
            photoAlt: outcome.photoAlt ?? null,
            options: (outcome.options ?? []).map((o) => ({ ...o, packages: o.packages ?? [] })),
          }
        : (outcome ?? null),
  };
}

export function listCases(): CaseRecord[] {
  return localStore
    .list<CaseRecord>("cases")
    .map((r) => normalizeCase(r.data))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCase(id: string): CaseRecord | undefined {
  const stored = localStore.get<CaseRecord>("cases", id)?.data;
  return stored ? normalizeCase(stored) : undefined;
}

export function saveCase(record: CaseRecord): void {
  localStore.put("cases", record.id, record);
}

/** The first photo of a case is stored under the case id, the later ones under `<id>#<number>`. */
const photoKey = (caseId: string, index: number): string =>
  index === 0 ? caseId : `${caseId}#${index + 1}`;

/** A case is deleted with all its photos. */
export function removeCase(id: string): void {
  const count = getCase(id)?.photoCount ?? 0;
  localStore.remove("cases", id);
  for (let i = 0; i < count; i++) void localStore.removeBlob("case-photo", photoKey(id, i));
}

export async function savePhoto(caseId: string, blob: Blob, index = 0): Promise<boolean> {
  if (!hasConsent("keep-case-photos")) return false;
  await localStore.putBlob("case-photo", photoKey(caseId, index), blob);
  return true;
}

export function getPhoto(caseId: string, index = 0): Promise<Blob | undefined> {
  return localStore.getBlob("case-photo", photoKey(caseId, index));
}

/** The stored photos of a case, in the order they were added. */
export async function getPhotos(caseId: string, count: number): Promise<Blob[]> {
  const all = await Promise.all(Array.from({ length: count }, (_, i) => getPhoto(caseId, i)));
  return all.filter((b): b is Blob => b !== undefined);
}

let snapshot: CaseRecord[] = [];
let snapshotKey = "[]";

function subscribe(onChange: () => void): () => void {
  return localStore.subscribe((c) => {
    if (c === "cases") onChange();
  });
}

/** The cached list while the stored cases are unchanged, also for a save made while no one listened. */
function read(): CaseRecord[] {
  const next = listCases();
  const key = JSON.stringify(next);
  if (key !== snapshotKey) {
    snapshotKey = key;
    snapshot = next;
  }
  return snapshot;
}

const EMPTY: CaseRecord[] = [];

export function useHistory(): CaseRecord[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
