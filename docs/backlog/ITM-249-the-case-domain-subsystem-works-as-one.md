---
id: ITM-249
title: The Case domain subsystem works as one
level: subsystem
realises:
  - UNCLEAR-CASES-CONSERVATIVE
  - UC-011
  - UC-024
modules:
  - MOD-case-model
  - MOD-hazard-precheck
  - MOD-output-check
  - MOD-safety-enforcement
  - MOD-legal-notices
  - MOD-illustrations
integrates: ARC-002
builds_on:
  - ITM-207
  - ITM-216
  - ITM-219
  - ITM-220
  - ITM-217
  - ITM-209
  - ITM-201
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-002-case-domain-subsystem.md
---
# ITM-249 The Case domain subsystem works as one

**REGISTER**

## Outcome

The six modules of the Case domain run together on client and server: the pre-check, the output check, enforcement and the legal notices over the case model. `src/test/safety.test.ts` is the subsystem test and covers every check the SPEC names for the domain.

## Acceptance

- Component test `src/test/safety.test.ts` passes, including the order of the rules and identical labels for every skill level.
- Postcondition of UC-011: every case was checked for hazards before instructions, and no output with risk high or critical holds a guide.

## Priority

Must (from AIR-10, FR-14, SAF-01, SAF-02), planned for sprint 2 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 1; it is planned for sprint 2 because it builds on ITM-217, planned for sprint 2. Until then the prototype's code serves sprint 1.
