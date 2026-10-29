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

export function listCases(): CaseRecord[] {
  return localStore
    .list<CaseRecord>("cases")
    .map((r) => r.data)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCase(id: string): CaseRecord | undefined {
  return localStore.get<CaseRecord>("cases", id)?.data;
}

export function saveCase(record: CaseRecord): void {
  localStore.put("cases", record.id, record);
}

export function removeCase(id: string): void {
  localStore.remove("cases", id);
}

export async function savePhoto(caseId: string, blob: Blob): Promise<boolean> {
  if (!hasConsent("keep-case-photos")) return false;
  await localStore.putBlob("case-photo", caseId, blob);
  return true;
}

export function getPhoto(caseId: string): Promise<Blob | undefined> {
  return localStore.getBlob("case-photo", caseId);
}

let snapshot: CaseRecord[] | null = null;

function subscribe(onChange: () => void): () => void {
  return localStore.subscribe((c) => {
    if (c !== "cases") return;
    snapshot = null;
    onChange();
  });
}

function read(): CaseRecord[] {
  snapshot ??= listCases();
  return snapshot;
}

const EMPTY: CaseRecord[] = [];

export function useHistory(): CaseRecord[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
