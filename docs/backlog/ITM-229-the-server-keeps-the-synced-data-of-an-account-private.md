---
id: ITM-229
title: The server keeps the synced data of an account private
level: module
realises:
  - ACCOUNT-SYNC
  - PRIVATE-BY-DEFAULT
  - DELETE-ALL-DATA
modules:
  - MOD-sync-store
builds_on:
  - ITM-214
  - ITM-218
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-sync-store.md, ARC-012 and ARC-014
---
# ITM-229 The server keeps the synced data of an account private

**REGISTER**

## Outcome

`prototype/src/sync-store/` stores the pushed records of an account in SQLite, returns them on `pull` only to that account, and `deleteSyncedData` removes all of them.

## Acceptance

- Unit tests with a temporary SQLite file: one account never pulls another's records; delete leaves no row; a push of an older version does not overwrite a newer one.

## Priority

Should (from FR-08), planned for sprint 9 or later, after the cut decision (docs/sprint-split.md)
