---
id: ITM-225
title: Every project is kept in the history
level: module
realises:
  - PROJECT-HISTORY
  - STEP-CHECK-OFF
  - UC-016
modules:
  - MOD-history
builds_on:
  - ITM-207
  - ITM-218
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-history.md
---
# ITM-225 Every project is kept in the history

**REGISTER**

## Outcome

`prototype/src/history/` saves each case as a `CaseRecord` with its steps and their check-off state, the materials used, notes and photos, lists completed and ongoing cases, and removes a case with its photos.

## Acceptance

- Unit tests with fake-indexeddb: a saved case lists with its steps and their state; a check-off survives a reload; removing a case removes its photos.
- Postcondition of UC-016: every completed and every ongoing project is in the history with its steps, materials used and notes.

## Priority

Must (from FR-07, FR-13), planned for sprint 5 of the sprint split (docs/sprint-split.md)
