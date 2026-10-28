---
id: ITM-231
title: Step questions and legal notices pass the pipeline
level: module
realises:
  - STEP-QUESTION-HAZARD-CHECK
  - CHECK-LOCALLY
  - UC-024
modules:
  - MOD-case-pipeline
builds_on:
  - ITM-230
  - ITM-222
  - ITM-217
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-pipeline.md
---
# ITM-231 Step questions and legal notices pass the pipeline

**REGISTER**

## Outcome

`answerStepQuestion` pre-checks the question, escalates a hazard without an AI call, and otherwise checks and enforces the step answer. `assessCase` attaches the notices of `noticesFor` to the outcome.

## Acceptance

- Unit tests: a hazard in a step question escalates with zero AI calls; a fence case carries "check locally"; a tenant case carries the tenant notice.

## Priority

Must (from AIR-10), planned for sprint 6 of the sprint split (docs/sprint-split.md)

Its requirements belong to sprint 2; it is planned for sprint 3 because it builds on ITM-222, planned for sprint 3. Until then the prototype's code serves sprint 2.
