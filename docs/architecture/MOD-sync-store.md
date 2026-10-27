---
id: MOD-sync-store
title: Synced copy on the server
folder: prototype/src/sync-store/
realises:
  - ACCOUNT-SYNC
  - PRIVATE-BY-DEFAULT
  - DELETE-ALL-DATA
  - DATA-RECTIFICATION
follows:
  - ARC-007
  - ARC-012
  - ARC-014
uses:
  - MOD-accounts.requireAccountId
  - MOD-accounts.UnauthenticatedError
  - MOD-local-store.StoredRecord
provides:
  - push
  - pull
  - deleteSyncedData
---
# MOD-sync-store Synced copy on the server

## Responsibility

It belongs to Account, sync and data rights (ARC-007). It keeps the synced copy of the records of each account and gives it to that account's devices.

## Parts

- `index.ts`: the interface.
- `db.ts`: the connection to `data/sync.sqlite` and the migrations.
- `functions.ts`: the server functions.
- `*.test.ts`: unit tests. Newer wins, and ties keep the stored copy; `pull` after a cursor; isolation between accounts; tombstones are passed on; a record that is too large is rejected; delete removes all of the account's rows.

## Data

The table `records(account_id, collection, id, updated_at, deleted, data_json, seq)`, keyed by `(account_id, collection, id)`. The column `seq` is a growing sequence number.

## Interfaces

Server functions, called remotely from the browser over HTTPS POST. Each serves only the account of the session. On the client, a network failure rejects the promise.

- `push: (i: { records: StoredRecord<unknown>[] }) => Promise<{ accepted: number; rejected: { id: string; reason: 'too-large' }[] }>` — stores a record if no copy exists or its `updatedAt` is later (ARC-014). A record larger than 256 KB is rejected.
- `pull: (i: { since: number }) => Promise<{ records: StoredRecord<unknown>[]; cursor: number }>` — the account's records with `seq` greater than `since`.
- `deleteSyncedData: () => Promise<{ ok: true }>` — removes all of the account's rows.

**Errors a caller handles:** `UnauthenticatedError` reaches the client as HTTP 401 without a session.

## Files

`data/sync.sqlite`, read and written.

## Uses

- `MOD-accounts.requireAccountId` and `MOD-accounts.UnauthenticatedError` — the account of the session.
- `MOD-local-store.StoredRecord` — the form of a synced record. It is imported with `import type` only, which leaves nothing of the client module in the server build. It uses the library `better-sqlite3`.
