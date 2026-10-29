---
id: ITM-220
title: Safety rules overrule the AI's draft
level: module
realises:
  - NO-GUIDE-AT-HIGH-RISK
  - NO-OPENING-MAINS-HOUSINGS
  - SKILL-DOES-NOT-UNLOCK
  - WATER-SHUT-OFF-FIRST
  - UNPLUG-BEFORE-OPENING
  - AGREE-WITH-PROFESSIONAL-BEFOREHAND
  - NO-PRINTED-SAFETY-PARTS
  - NO-ASSUMPTIONS-AS-FACTS
  - NAME-DECIDING-INFORMATION
  - STEP-QUESTION-HAZARD-CHECK
modules:
  - MOD-safety-enforcement
builds_on:
  - ITM-207
  - ITM-216
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-safety-enforcement.md
---
# ITM-220 Safety rules overrule the AI's draft

**REGISTER**

## Outcome

`enforceSafety` moves from `lib/repair.schema.ts` into `prototype/src/safety-enforcement/` with its rules in a fixed order: no guide at high or critical risk, no step that opens a mains housing (with `opensHousing` behind the AI's flag), water shut off and device unplugged first, the agreement with the professional for DIY preparation, no printed part for a safety-critical use, assumptions listed as assumptions, and the same labels for every skill level. `enforceStepAnswer` escalates a step question with a hazard. The module stays one; the split into two modules (ITM-201) is postponed.

## Acceptance

- Unit tests per rule; the order of the rules is a test; a case run with a beginner and an expert profile gives identical labels and escalations.
- `src/test/safety.test.ts` passes unchanged.

## Priority

Must (from AIR-02, FR-14, SAF-04, SAF-06, SAF-07), planned for sprint 3 of the sprint split (docs/sprint-split.md)
