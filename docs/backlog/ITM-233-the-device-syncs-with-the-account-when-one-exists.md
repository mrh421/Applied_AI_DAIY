---
id: ITM-233
title: The device syncs with the account when one exists
level: module
realises:
  - ACCOUNT-SYNC
  - USE-WITHOUT-ACCOUNT
  - STATUS-MESSAGES
modules:
  - MOD-sync-client
builds_on:
  - ITM-214
  - ITM-218
  - ITM-229
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-sync-client.md and ARC-014
---
# ITM-233 The device syncs with the account when one exists

**REGISTER**

## Outcome

`prototype/src/sync-client/` starts syncing after sign-in, pushes and pulls changed records, keeps working offline, and does nothing without an account; `useSyncState` gives the state for a status message.

## Acceptance

- Unit tests with the server replaced: without an account no request is made; a change made offline is pushed after reconnect; a change of account asks before mixing data.

## Priority

Should (from FR-08), planned for sprint 5 of docs/Implementation_Plan_EN.md
