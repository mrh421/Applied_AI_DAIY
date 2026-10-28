---
id: ITM-247
title: 3D models and the cost estimate on screen
level: module
realises:
  - 3D-MODEL-SUGGESTION
  - 3D-MODEL-DETAILS
  - NO-PRINTED-SAFETY-PARTS
  - TOTAL-COST-ESTIMATE
  - UNCHECKED-PRICE-OR-FIT-MARKED
  - UC-007
modules:
  - MOD-materials-screens
builds_on:
  - ITM-245
  - ITM-228
  - ITM-236
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-materials-screens.md
---
# ITM-247 3D models and the cost estimate on screen

**REGISTER**

## Outcome

The materials screens show a suggested 3D model with its details and link, or the note that a printed part is not suitable, and each option's total cost with the unchecked prices and fits marked.

## Acceptance

- Component tests: a model shows its four details; a safety-critical part shows the note; a total shows its marked lines.
- Postcondition of UC-007: no printed part was recommended for a safety-critical use without professional review.

## Priority

Could (from FR-06, SAF-04, SUS-06), planned for sprint 6 of docs/Implementation_Plan_EN.md
