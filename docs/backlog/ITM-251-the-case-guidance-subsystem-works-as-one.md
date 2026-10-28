---
id: ITM-251
title: The Case guidance subsystem works as one
level: subsystem
realises:
  - UC-001
  - UC-002
  - UC-004
  - UC-016
modules:
  - MOD-case-pipeline
  - MOD-case-session
integrates: ARC-004
builds_on:
  - ITM-231
  - ITM-235
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-004-case-guidance-subsystem.md
---
# ITM-251 The Case guidance subsystem works as one

**REGISTER**

## Outcome

The session drives the pipeline from the first description to the last checked step, with the AI tasks replaced by recorded drafts.

## Acceptance

- Component test `prototype/src/test/case-guidance.test.ts`: a case with two rounds of questions ends in a guide; a hazard in an answer escalates; checked steps are in the history.
- Postcondition of UC-001: the case holds the description, the optional photo and the interpretation with the stored inventory, and nothing blocked the start.

## Priority

Must (from AIR-02, FR-01, FR-02, FR-07, FR-13, NFR-01, NFR-03, SAF-06), planned for sprint 4 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 1; it is planned for sprint 4 because it builds on ITM-235, planned for sprint 4. Until then the prototype's code serves sprint 1.
