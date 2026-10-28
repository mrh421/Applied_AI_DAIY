---
id: ITM-216
title: An escalation names the actions and the professional of each hazard
level: module
realises:
  - HAZARD-SAFETY-MEASURES
  - HAZARD-PROFESSIONAL
  - EMERGENCY-RISK-CRITICAL
  - OUT-OF-SCOPE-RISK-HIGH
  - EMERGENCY-ACTIONS-FIRST
  - OUT-OF-SCOPE-ESCALATION
  - OUT-OF-SCOPE-NO-INSTRUCTIONS
  - NO-GUIDE-FOR-HAZARDS
  - ESCALATION-REASON
  - NO-BREAKER-ONLY-ISOLATION
modules:
  - MOD-hazard-precheck
builds_on:
  - ITM-215
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-hazard-precheck.md
---
# ITM-216 An escalation names the actions and the professional of each hazard

**REGISTER**

## Outcome

`escalationFor(kinds, origin)` builds the escalation: `critical` for an emergency and `high` for out-of-scope work, the immediate actions and professionals of each kind with the emergencies first, and a plain reason why no instructions are given. Each kind's actions belong to that kind only, and no action presents switching off a breaker as securing a circuit.

## Acceptance

- Unit tests: the actions and the professional of each kind; `critical` and `high`; emergency actions first for a mixed input; the generic escalation for an empty list; no action text names the breaker as isolation.
- `src/test/safety.test.ts` covers the checks the SPEC names for HAZARD-SAFETY-MEASURES and passes.

## Priority

Must (from SAF-02), planned for sprint 1 of docs/Implementation_Plan_EN.md
