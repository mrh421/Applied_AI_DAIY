---
id: MOD-history
title: Project history
folder: prototype/src/history/
realises:
  - PROJECT-HISTORY
  - STEP-CHECK-OFF
  - DEDUCT-CONSUMED
  - DATA-RECTIFICATION
  - DEVICE-STORAGE-CONSENT
follows:
  - ARC-006
  - ARC-015
uses:
  - MOD-local-store.localStore
  - MOD-case-model.Answer
  - MOD-case-model.CaseOutcome
  - MOD-case-model.Money
  - MOD-case-model.Quantity
provides:
  - CaseRecord
  - listCases
  - getCase
  - saveCase
  - removeCase
  - savePhoto
  - getPhoto
  - useHistory
---
# MOD-history Project history

## Responsibility

It belongs to Personal data (ARC-006). It stores the case records: ongoing and completed projects, with their outcome, steps and check-offs, materials used and notes, and, under consent, their photo.

## Parts

- `index.ts`: the interface.
- `history.ts`: the functions.
- `*.test.ts`: unit tests. Ongoing and completed records are listed; check-off states and notes persist; a photo is not saved without consent; remove.

## Data

Case records in the collection `cases` of MOD-local-store; photos as `case-photo` blobs under the consent `keep-case-photos`.

## Interfaces

- `CaseRecord` — `{ id: string; createdAt: string; rulesVersion: string; chosenOffers: Record<string, string>; status: 'ongoing' | 'completed'; description: string; hadPhoto: boolean; answers: Answer[]; round: 0 | 1 | 2; outcome: CaseOutcome | null; chosenOptionId: string | null; explanations: Record<string, Record<number, string>>; checked: Record<string, number[]>; notes: string; budget: Money | null; materialsUsed: { name: string; quantity: Quantity; inventoryItemId?: string }[] }`. `rulesVersion` is the `SAFETY_RULES_VERSION` under which `outcome` was made. `chosenOffers` maps a needed item to the id of the offer the user chose, so that the cost totals survive a reload. `explanations` maps a package id and a step number to its basics; `checked` maps a package id to its checked step numbers.
- `listCases(): CaseRecord[]` — newest first.
- `getCase(id: string): CaseRecord | undefined` — one record.
- `saveCase(record: CaseRecord): void` — stores a record.
- `removeCase(id: string): void` — removes a record.
- `savePhoto(caseId: string, blob: Blob): Promise<boolean>` — `false` without the consent `keep-case-photos`.
- `getPhoto(caseId: string): Promise<Blob | undefined>` — the kept photo.
- `useHistory(): CaseRecord[]` — the records as a React hook.

**Errors a caller handles:** `StorageFullError` from MOD-local-store, passed on.

## Files

Through MOD-local-store only, the key `daiy.v1.cases` and the IndexedDB blobs.

## Uses

- `MOD-local-store.localStore` — reading and writing records and photos.
- `MOD-case-model.Answer`, `MOD-case-model.CaseOutcome`, `MOD-case-model.Money` and `MOD-case-model.Quantity` — the fields of a case record.
