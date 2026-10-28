---
id: ITM-259
title: Both persona groups start a case without help
level: system
realises:
  - USABILITY-START-WITHOUT-HELP
  - THREE-STEP-START
  - UC-001
modules:
  - MOD-case-screens
  - MOD-app-shell
builds_on:
  - ITM-256
tests:
  - system
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/Implementation_Plan_EN.md, Testing (level 3)
---
# ITM-259 Both persona groups start a case without help

**REGISTER**

## Outcome

The usability test with both persona groups runs on the build of the Must items; its findings enter the backlog as defects or changes.

## Acceptance

- At least 4 of 5 participants per persona group start a case without help, in at most three required steps.
- Every finding is an item or a change request.

## Priority

Must (from FR-01, NFR-01, NFR-03), planned for sprint 7 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 1; it is planned for sprint 7 because it builds on ITM-256, planned for sprint 7. Until then the prototype's code serves sprint 1.
