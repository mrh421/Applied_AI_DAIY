---
id: ITM-203
title: One call plans the materials of a case
level: module
realises:
  - BUDGET-RESPECTED
  - OFFER-COMPARISON
  - UC-008
modules:
  - MOD-cost-estimate
  - MOD-materials-screens
builds_on: []
tests:
  - unit
  - component
origin:
  - Sonnet review of the architecture draft, finding m-08 (2026-10-27): the materials screens call `matchStock`, `searchOffers`, `searchModels` and `estimateCosts` themselves, so the order of these calls has no owner and ARC-008 says the user interface holds no business rules
---
# ITM-203 One call plans the materials of a case

**REGISTER**

## Outcome

MOD-cost-estimate offers `planMaterials(record)`, which matches the stock, searches the offers and models and estimates the costs in one order. The screens of MOD-materials-screens call it and show the result.

## Acceptance

- The screens call no catalogue or stock function directly.
- A unit test of `planMaterials` covers the order and the budget total; the screen tests of UC-005 to UC-008 pass.

## Postponed

Sprint daiy/08, 2026-11-01: the job (1755-fd8c) stopped with no branch. The item is an internal refactor of the screens ITM-245 and ITM-246 built, it needs the interface `planMaterials` added to the accepted file MOD-cost-estimate (back to waiting for acceptance), and nothing visible depends on it. Done only if time remains at the end. ITM-252 no longer builds on it.
