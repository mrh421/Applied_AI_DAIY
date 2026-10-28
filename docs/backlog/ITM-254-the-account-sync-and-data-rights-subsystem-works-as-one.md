---
id: ITM-254
title: The Account, sync and data rights subsystem works as one
level: subsystem
realises:
  - UC-018
  - UC-021
  - UC-022
  - UC-023
modules:
  - MOD-accounts
  - MOD-sync-store
  - MOD-sync-client
  - MOD-data-portability
integrates: ARC-007
builds_on:
  - ITM-214
  - ITM-229
  - ITM-233
  - ITM-237
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-007-account-sync-and-data-rights-subsystem.md
---
# ITM-254 The Account, sync and data rights subsystem works as one

**REGISTER**

## Outcome

An account syncs profile, inventory and history between two devices, exports them and erases them everywhere.

## Acceptance

- Component test `prototype/src/test/account-sync.test.ts` with a temporary SQLite file and two device stores: a change on one device appears on the other; export holds all three; erase leaves nothing on either side.
- Postcondition of UC-023: no profile, inventory, history or account data remains on the device or in the account.

## Priority

Should (from FR-08, NFR-10), planned for sprint 9 or later, after the cut decision (docs/sprint-split.md)
