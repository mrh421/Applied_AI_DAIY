---
id: ITM-252
title: The Materials and offers subsystem works as one
level: subsystem
realises:
  - UC-005
  - UC-006
  - UC-007
  - UC-008
modules:
  - MOD-stock-matching
  - MOD-catalogue
  - MOD-link-check
  - MOD-cost-estimate
integrates: ARC-005
builds_on:
  - ITM-232
  - ITM-227
  - ITM-228
  - ITM-236
  - ITM-203
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-005-materials-and-offers-subsystem.md
---
# ITM-252 The Materials and offers subsystem works as one

**REGISTER**

## Outcome

For a guide and an inventory, the four modules give the matched stock, the offers for what is missing, a 3D model where one fits and the costs per option.

## Acceptance

- Component test `prototype/src/test/materials.test.ts` over the sample catalogue: available items get no offer; second-hand first; totals stay within the budget or are marked.
- Postcondition of UC-008: every option shows a total, within the budget or marked.

## Priority

Must (from AIR-05, AIR-06, AIR-09, FR-04, FR-06, FR-12, SAF-04, SAF-05, SUS-01, SUS-02, SUS-03, SUS-04, SUS-05, SUS-06, SUS-07), planned for sprint 9 or later, after the cut decision (docs/sprint-split.md)

Its requirements belong to sprint 4; it is planned for sprint 6 because it builds on ITM-228, planned for sprint 6. Until then the prototype's code serves sprint 4.
