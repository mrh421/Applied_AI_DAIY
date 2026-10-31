---
id: ITM-256
title: A full case runs end to end in the browser
level: system
realises:
  - UC-001
  - UC-002
  - UC-003
  - UC-004
  - UC-011
  - UC-017
modules:
  - MOD-app-shell
  - MOD-ai-gateway
builds_on:
  - ITM-249
  - ITM-250
  - ITM-251
  - ITM-252
  - ITM-253
  - ITM-255
tests:
  - system
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-001 and ARC-016
---
# ITM-256 A full case runs end to end in the browser

**REGISTER**

## Outcome

Playwright in `prototype/tests/system/` runs the production build against the AI stub: a repair with questions, guide and check-off; a gas smell that escalates; a project with work packages and materials; all without an account. CI runs it on every pull request.

## Acceptance

- System tests pass on the production build in CI.
- Postconditions of UC-011 and UC-017: the hazard case holds an escalation and no guide; the full case needed no account.

## Priority

Must (from AIR-01, AIR-02, AIR-07, FR-01, FR-02, FR-03, FR-05, FR-07, FR-08, FR-14, NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-09, SAF-01, SAF-02, SAF-03, SAF-06), planned for sprint 9 or later, after the cut decision (docs/sprint-split.md)

Its requirements belong to sprint 1; it is planned for sprint 7 because it builds on ITM-255, planned for sprint 7. Until then the prototype's code serves sprint 1.
