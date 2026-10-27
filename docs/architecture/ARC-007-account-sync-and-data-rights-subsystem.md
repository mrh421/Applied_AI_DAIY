---
id: ARC-007
title: Subsystem Account, sync and data rights
refines: ARC-001
forced_by:
  - ACCOUNT-SYNC
  - PASSWORDS-HASHED
  - ACCESSIBLE-AUTHENTICATION
  - PRIVATE-BY-DEFAULT
  - USE-WITHOUT-ACCOUNT
  - DATA-EXPORT
  - DELETE-ALL-DATA
  - DATA-RECTIFICATION
  - DATA-MINIMISATION
  - PRIVACY-NOTICE
  - UC-017
  - UC-018
  - UC-019
  - UC-021
  - UC-022
  - UC-023
designs:
  - MOD-accounts
  - MOD-sync-store
  - MOD-sync-client
  - MOD-data-portability
---
# ARC-007 Subsystem Account, sync and data rights

## Context

A user may create an account that syncs profile, inventory and history across devices (ACCOUNT-SYNC, UC-018). Account data must meet these requirements:

- passwords are stored hashed (PASSWORDS-HASHED);
- signing in needs no cognitive test, or an alternative exists (ACCESSIBLE-AUTHENTICATION);
- nothing is visible to other users (PRIVATE-BY-DEFAULT).

Export and erasure must cover the device and, where one exists, the account (DATA-EXPORT, DELETE-ALL-DATA, UC-022, UC-023). These functions span both nodes of ARC-001 and all of Personal data.

## Decision

**Responsibility:** this subsystem owns everything that spans the device and the account: the optional account and its sign-in, the synced copy of the device records, and the export and erasure of all personal data on both.

**Interface it offers:**

- Server functions of MOD-accounts, which are remote calls over HTTPS:
  - `signUp`, `signIn`, `signOut`, `currentAccount`;
  - `passkeyRegistrationOptions`, `verifyPasskeyRegistration`, `passkeySignInOptions`, `verifyPasskeySignIn`;
  - `changeUsername`, `changePassword`, `deleteAccount`.
- Server functions of MOD-sync-store: `push`, `pull`, `deleteSyncedData`.
- The client functions `startSync`, `syncNow`, `resetSync` and `useSyncState` (MOD-sync-client).
- The client functions `exportAll` and `eraseAll` (MOD-data-portability).

**Modules:**

| Module | Responsibility | Runs on |
|---|---|---|
| MOD-accounts | Accounts, credentials, passkeys and sessions | server |
| MOD-sync-store | The synced copy of the records of each account | server |
| MOD-sync-client | Keeping the local store and the synced copy equal: push, pull, newest change wins | client |
| MOD-data-portability | Export of all personal data into one JSON file, and erasure on the device and in the account | client |

The relations:

- MOD-sync-store uses MOD-accounts to resolve the session to an account, and uses the record type of MOD-local-store.
- MOD-sync-client uses MOD-local-store, MOD-sync-store and MOD-accounts.
- MOD-data-portability uses MOD-profile, MOD-inventory, MOD-history, MOD-consent, MOD-local-store, MOD-accounts, MOD-sync-store and MOD-sync-client.

Each server module owns its own SQLite file (ARC-012). Authentication is decided in ARC-013, and sync in ARC-014.

PRIVATE-BY-DEFAULT is met by design: no server function returns data of another account, and the product has no sharing function on the server. A user shares data only through their own action, for example by sharing a handover brief from the device.

**Principles:** client-server; layers, it depends only on Personal data below it; one responsibility per module; KISS.

## Alternatives

- **Accounts in Personal data.** Rejected: Personal data must work without a server (USE-WITHOUT-ACCOUNT). Mixing in remote calls would make it depend upwards.
- **Export and delete in Personal data.** Rejected: they must reach the account as well (UC-022 A1, UC-023 A1). Placing them there would make Personal data depend on this subsystem, which would be a subsystem cycle.
- **A hosted backend-as-a-service for accounts and sync.** Rejected in ARC-012 and ARC-013: it adds a recipient of personal data and a vendor dependency, for two small tables.

## Consequences

- The account stores only a user name, a password hash, passkey public keys, sessions and the synced records. Photos never leave the device (DATA-MINIMISATION).
- If deleting the account fails, the device data is still deleted, and the report names what remains (UC-023 A4).
