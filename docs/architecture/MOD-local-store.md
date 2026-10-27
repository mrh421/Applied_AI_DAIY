---
id: MOD-local-store
title: Repository on the device
folder: prototype/src/local-store/
realises:
  - PROFILE-ON-DEVICE
  - INVENTORY-ON-DEVICE
  - PROJECT-HISTORY
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - DELETE-ALL-DATA
  - DATA-EXPORT
  - ACCOUNT-SYNC
follows:
  - ARC-006
  - ARC-015
uses:
  - MOD-consent.ConsentKind
  - MOD-consent.hasConsent
  - MOD-consent.registerPurge
provides:
  - Collection
  - BlobKind
  - StoredRecord
  - StorageBasis
  - StorageFullError
  - ConsentMissingError
  - STORAGE_REGISTER
  - localStore
---
# MOD-local-store Repository on the device

## Responsibility

It belongs to Personal data (ARC-006). It stores the user's records and blobs on the device, and keeps the register that names, for every stored item, the basis on which it is stored.

## Parts

- `index.ts`: the interface.
- `records.ts`: localStorage collections.
- `blobs.ts`: IndexedDB through `idb-keyval`.
- `register.ts`: the storage register.
- `events.ts`: change subscription.
- `*.test.ts`: unit tests with jsdom and fake-indexeddb. The records persist; tombstones; `changedSince`; `applyRemote`, newest wins; a blob is refused without consent and purged on withdrawal; `clearAll` leaves no register key; every key the app writes is in the register.

## Data

The register `STORAGE_REGISTER` lists every key:

| Key | Basis |
|---|---|
| `daiy.v1.profile` | necessary for the skill profile |
| `daiy.v1.materials` | necessary for the inventory |
| `daiy.v1.tools` | necessary for the inventory |
| `daiy.v1.cases` | necessary for the project history |
| `daiy.v1.consents` | necessary to record consents (MOD-consent) |
| `daiy.v1.sync` | necessary for the sync the user started (MOD-sync-client) |
| `case-photo` blobs | consent `keep-case-photos` |
| cookie `daiy_session` (set by the server, ARC-013) | necessary for the sign-in the user requested |

At start, the module registers `removeBlobs('case-photo')` as the purge handler of `keep-case-photos` with MOD-consent.

## Interfaces

- `Collection` — `'profile' | 'materials' | 'tools' | 'cases'`.
- `BlobKind` — `'case-photo'`.
- `StoredRecord<T>` — `{ id: string; collection: Collection; updatedAt: number; deleted: boolean; data: T }`.
- `StorageBasis` — `{ kind: 'necessary'; for: string } | { kind: 'consent'; consent: ConsentKind }`.
- `StorageFullError` — `class StorageFullError extends Error {}`, thrown when localStorage is full.
- `ConsentMissingError` — `class ConsentMissingError extends Error { readonly consent: ConsentKind }`, thrown when a blob is written without its consent.
- `STORAGE_REGISTER: Record<string, StorageBasis>` — the register under Data.
- `localStore` — the repository object:
  - `list<T>(c: Collection): StoredRecord<T>[]` — without tombstones;
  - `get<T>(c: Collection, id: string): StoredRecord<T> | undefined`;
  - `put<T>(c: Collection, id: string, data: T): StoredRecord<T>` — sets `updatedAt = Date.now()`; throws `StorageFullError`;
  - `remove(c: Collection, id: string): void` — writes a tombstone;
  - `changedSince(ts: number): StoredRecord<unknown>[]` — with tombstones, for sync;
  - `applyRemote(records: StoredRecord<unknown>[]): void` — keeps the later `updatedAt`; ties keep the local copy;
  - `subscribe(listener: (c: Collection) => void): () => void`;
  - `putBlob(kind: BlobKind, id: string, blob: Blob): Promise<void>` — rejects with `ConsentMissingError`;
  - `getBlob(kind: BlobKind, id: string): Promise<Blob | undefined>`;
  - `removeBlobs(kind: BlobKind): Promise<void>`;
  - `clearAll(): Promise<void>` — every key of the register and every blob.

**Errors a caller handles:** `StorageFullError` and `ConsentMissingError`.

## Files

- localStorage keys `daiy.v1.profile`, `daiy.v1.materials`, `daiy.v1.tools` and `daiy.v1.cases`, read and written; `clearAll` also removes the other keys of the register.
- IndexedDB database `keyval-store`, read and written.

## Uses

- `MOD-consent.ConsentKind` — the basis of consent-gated items.
- `MOD-consent.hasConsent` — before writing a blob.
- `MOD-consent.registerPurge` — to purge photos when their consent is withdrawn.
