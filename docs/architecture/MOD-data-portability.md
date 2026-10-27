---
id: MOD-data-portability
title: Export and erase all data
folder: prototype/src/data-portability/
realises:
  - DATA-EXPORT
  - DELETE-ALL-DATA
  - UC-022
  - UC-023
follows:
  - ARC-007
uses:
  - MOD-profile.getProfile
  - MOD-profile.SkillProfile
  - MOD-inventory.listMaterials
  - MOD-inventory.listTools
  - MOD-inventory.MaterialItem
  - MOD-inventory.ToolItem
  - MOD-history.listCases
  - MOD-history.CaseRecord
  - MOD-consent.listConsents
  - MOD-consent.clearConsents
  - MOD-consent.ConsentRecord
  - MOD-local-store.localStore
  - MOD-accounts.currentAccount
  - MOD-accounts.deleteAccount
  - MOD-accounts.AccountData
  - MOD-sync-store.deleteSyncedData
  - MOD-sync-client.resetSync
provides:
  - ExportFile
  - EraseReport
  - ExportError
  - exportAll
  - eraseAll
---
# MOD-data-portability Export and erase all data

## Responsibility

It belongs to Account, sync and data rights (ARC-007). It writes all of the user's data into one machine-readable file, and erases all of it on the device and in the account.

## Parts

- `index.ts`: the interface.
- `export.ts`, `erase.ts`.
- `*.test.ts`: unit tests. The export contains every section, including empty ones when no data exists; the account section only with an account; erasure leaves no register key and no blob; a failed account deletion is reported.

## Data

The export format is JSON, UTF-8, with the media type `application/json`. Photos are not part of the export, because the user's own photo files remain with the user. The export lists `hadPhoto` per case.

## Interfaces

- `ExportFile` — `{ format: 'daiy-export'; version: 1; exportedAt: string; profile: SkillProfile; materials: MaterialItem[]; tools: ToolItem[]; history: CaseRecord[]; consents: ConsentRecord[]; account: AccountData | null }`.
- Kept case photos are not part of `ExportFile`. Whether Art. 20 GDPR needs them is for the approver to decide; if so, `ExportFile` gets a `photos` entry.
- `EraseReport` — `{ device: 'erased' | 'failed'; account: 'erased' | 'none' | 'failed'; remaining: string[] }`.
- `ExportError` — `class ExportError extends Error {}`.
- `exportAll(): Promise<Blob>` — the export file; rejects with `ExportError`; stored data stays unchanged.
- `eraseAll(): Promise<EraseReport>` — with an account, `deleteSyncedData`, then `deleteAccount`, where a failure is recorded and the device is erased anyway; when `currentAccount` itself fails (offline), `account` is `'failed'` and `remaining` names the account data on the server; then `localStore.clearAll()`, `clearConsents()` and `resetSync()`; returns the report, whose `remaining` names what could not be erased, for example the account data on the server.

**Errors a caller handles:** `ExportError` from `exportAll`. `eraseAll` does not reject; it reports every failure.

## Files

Through MOD-local-store and MOD-consent, every key of the register and every blob. It produces the export as a download in the browser.

## Uses

- `MOD-profile.getProfile` and `MOD-profile.SkillProfile`, `MOD-inventory.listMaterials`, `MOD-inventory.listTools`, `MOD-inventory.MaterialItem` and `MOD-inventory.ToolItem`, `MOD-history.listCases` and `MOD-history.CaseRecord`, `MOD-consent.listConsents` and `MOD-consent.ConsentRecord` — the sections of the export.
- `MOD-consent.clearConsents` and `MOD-local-store.localStore` — erasure on the device.
- `MOD-accounts.currentAccount`, `MOD-accounts.deleteAccount` and `MOD-accounts.AccountData` — the account section and the account's deletion.
- `MOD-sync-store.deleteSyncedData` — the synced copy's deletion.
- `MOD-sync-client.resetSync` — the sync marks after erasure.
