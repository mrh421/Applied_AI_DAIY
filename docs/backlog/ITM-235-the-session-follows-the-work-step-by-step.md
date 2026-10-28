---
id: ITM-235
title: The session follows the work step by step
level: module
realises:
  - STEP-CHECK-OFF
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
  - PROJECT-HISTORY
  - GO-BACK
  - DEDUCT-CONSUMED
  - UC-004
modules:
  - MOD-case-session
builds_on:
  - ITM-234
  - ITM-231
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-session.md
---
# ITM-235 The session follows the work step by step

**REGISTER**

## Outcome

The session checks steps off and keeps their state in the history, sends a question about a step through `answerStepQuestion`, lets the user go back to an earlier screen, and offers to deduct the used materials when the case is done.

## Acceptance

- Unit tests: a check-off survives a reload; a step question escalates on a hazard; going back keeps the answers; deduction happens only after confirmation.
- Postcondition of UC-004: every finished step is checked off and its state kept.

## Priority

Must (from FR-07, FR-11, FR-13), planned for sprint 4 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 3; it is planned for sprint 4 because it builds on ITM-234, planned for sprint 4. Until then the prototype's code serves sprint 3.
