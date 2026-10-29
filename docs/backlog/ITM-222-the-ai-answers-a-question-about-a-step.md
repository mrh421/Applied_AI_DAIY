---
id: ITM-222
title: The AI answers a question about a step
level: module
realises:
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
modules:
  - MOD-ai-tasks
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-ai-tasks.md
built_by:
  - 3ad6d625c36902a193ba13f3be9f70bc4f733d90
---
# ITM-222 The AI answers a question about a step

**REGISTER**

## Outcome

`draftStepAnswer` answers a question asked during the work in the context of its step and can re-explain the step more simply, with the same output schema rules as the other drafts.

## Acceptance

- Unit tests with the gateway replaced: the request carries the step and the question; a re-explain request asks for a simpler explanation and no new step.

## Priority

Must (from FR-07), planned for sprint 6 of the sprint split (docs/sprint-split.md)
