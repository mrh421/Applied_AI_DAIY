---
id: ITM-230
title: The case pipeline checks before and after the AI
level: module
realises:
  - RISK-CHECK-FIRST
  - PRECHECK-COVERS-FOLLOW-UP-ANSWERS
  - NO-UNVALIDATED-OUTPUT
  - OUTPUT-COMPLETENESS-CHECK
  - OUTPUT-PROHIBITED-PATH-CHECK
  - NO-GUIDE-AT-HIGH-RISK
  - UNDERSTANDABLE-ERROR-NOTICE
  - REPAIR-FIRST
  - REUSE-FIRST
modules:
  - MOD-case-pipeline
builds_on:
  - ITM-207
  - ITM-208
  - ITM-221
  - ITM-216
  - ITM-219
  - ITM-220
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-pipeline.md
---
# ITM-230 The case pipeline checks before and after the AI

**REGISTER**

## Outcome

The server functions of `lib/repair.functions.ts` become `assessCase` and `explainSteps` in `prototype/src/case-pipeline/`: pre-check of the description and every answer, an escalation without any AI call on a hazard, the AI draft, the output check, one retry, then enforcement and the option ranking. A draft that fails twice or an AI error gives an understandable notice, never the draft.

## Acceptance

- Unit tests with MOD-ai-tasks replaced by a counting double: a hazard in the description or in a follow-up answer escalates with zero AI calls; a malformed draft is retried once and then gives a notice; no unchecked draft is returned.

## Priority

Must (from AIR-07, FR-05, NFR-05, SAF-01, SAF-03), planned for sprint 1 of docs/Implementation_Plan_EN.md
