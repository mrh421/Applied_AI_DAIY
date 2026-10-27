---
id: MOD-sync-client
title: Keep device and account equal
folder: prototype/src/sync-client/
realises:
  - ACCOUNT-SYNC
  - USE-WITHOUT-ACCOUNT
  - DATA-RECTIFICATION
  - STATUS-MESSAGES
  - UC-018
follows:
  - ARC-007
  - ARC-014
uses:
  - MOD-local-store.localStore
  - MOD-sync-store.push
  - MOD-sync-store.pull
  - MOD-accounts.currentAccount
provides:
  - SyncState
  - startSync
  - syncNow
  - resetSync
  - resolveAccountChange
  - useSyncState
---
# MOD-sync-client Keep device and account equal

## Responsibility

It belongs to Account, sync and data rights (ARC-007). It pushes local changes to the account, and pulls and applies remote changes, whenever the user is signed in (UC-018 A3 and A4).

## Parts

- `index.ts`: the interface.
- `sync.ts`: the triggers and the sync step.
- `*.test.ts`: unit tests with the server functions replaced. An offline change is pushed later; a remote change is applied; newest wins on conflict; nothing happens without an account.

## Data

The localStorage key `daiy.v1.sync` holds `{ lastPushedAt: number; cursor: number; accountId: string }`. A sync step:

1. Check for an account with `currentAccount`. Without one, do nothing.
2. `push(localStore.changedSince(lastPushedAt))`.
3. `pull({since: cursor})`, then `localStore.applyRemote`.
4. Update the marks.

## Interfaces

- `SyncState` — `{ signedIn: boolean; status: 'idle' | 'syncing' | 'offline' | 'error' | 'account-changed'; lastSyncedAt: number | null }`, shown as a status message.
- `startSync(): () => void` — starts the triggers: app start, local change (2 s debounce), online event; returns a stop function.
- `syncNow(): Promise<SyncState>` — one sync step on demand.
- `resetSync(): void` — removes the marks, after sign-out or delete-all.
- `resolveAccountChange(choice: 'merge' | 'clear'): Promise<SyncState>` — after a sign-in as an account other than the one in the mark: `merge` pushes the device records to the new account, `clear` empties the device collections first. Until it is called, the status is `account-changed` and nothing is pushed.
- `useSyncState(): SyncState` — the state as a React hook.

**Errors a caller handles:** none thrown. A network failure sets `offline` and keeps the marks, so the changes are pushed later; HTTP 401 sets `signedIn` to false; a rejected record sets `error`.

## Files

The localStorage key `daiy.v1.sync`, read and written.

## Uses

- `MOD-local-store.localStore` — `changedSince`, `applyRemote` and `subscribe`.
- `MOD-sync-store.push` and `MOD-sync-store.pull` — the server side of sync.
- `MOD-accounts.currentAccount` — whether a user is signed in.
