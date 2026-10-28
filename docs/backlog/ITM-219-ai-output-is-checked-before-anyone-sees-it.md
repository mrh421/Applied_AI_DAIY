---
id: ITM-219
title: AI output is checked before anyone sees it
level: module
realises:
  - OUTPUT-COMPLETENESS-CHECK
  - OUTPUT-PROHIBITED-PATH-CHECK
  - NO-UNVALIDATED-OUTPUT
  - NUMBERED-STEPS
  - PACKAGE-REASON
  - HANDOVER-BRIEF
  - NAME-DECIDING-INFORMATION
  - FOLLOW-UP-QUESTIONS
modules:
  - MOD-output-check
builds_on:
  - ITM-207
  - ITM-216
  - ITM-209
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-output-check.md
---
# ITM-219 AI output is checked before anyone sees it

**REGISTER**

## Outcome

`prototype/src/output-check/` offers `checkAssessmentDraft`, `checkExplanationDraft` and `checkStepAnswerDraft`. Each returns the failures of a draft: a missing part of the guide, unnumbered steps, a package without a reason or a deciding information, a professional package without a handover brief, more than two rounds of questions, an unknown illustration, and a prohibited path such as a guide for a hazard the pre-check knows or a step that isolates by breaker alone.

## Acceptance

- Unit tests, one per failure, each with a passing and a failing draft; a draft with no failure passes unchanged.

## Priority

Must (from FR-02, FR-14, FR-15, NFR-05, SAF-03, SAF-06), planned for sprint 3 of the sprint split (docs/sprint-split.md)
