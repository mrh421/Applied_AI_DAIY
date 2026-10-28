---
id: ITM-244
title: The work is carried out step by step on screen
level: module
realises:
  - STEP-CHECK-OFF
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
  - UC-004
modules:
  - MOD-case-screens
builds_on:
  - ITM-242
  - ITM-235
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-screens.md
---
# ITM-244 The work is carried out step by step on screen

**REGISTER**

## Outcome

`ExecutionScreen` shows one step at a time with a check-off, a "explain simpler" control and a question field; an escalating answer is shown as such.

## Acceptance

- Component tests: checking off advances and persists; a question shows its answer under its step; a hazard question shows the escalation.

## Priority

Must (from FR-07), planned for sprint 8 of the sprint split (docs/sprint-split.md)

Its requirements belong to sprint 3; it is planned for sprint 4 because it builds on ITM-242, planned for sprint 4. Until then the prototype's code serves sprint 3.
