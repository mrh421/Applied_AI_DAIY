---
id: ITM-272
title: The plan shows an estimated cost, with price estimates where the catalogue has no price
level: module
realises:
  - TOTAL-COST-ESTIMATE
  - BUDGET-RESPECTED
  - AIR-05
  - AIR-06
modules:
  - MOD-case-model
  - MOD-ai-tasks
  - MOD-cost-estimate
  - MOD-materials-screens
  - MOD-case-screens
tests:
  - unit
  - component
  - system
origin:
  - mrh (2026-11-02): no project costs were shown; the cost estimate sat only on the materials page and the sample catalogue knows only washers, a hinge and a sealant, so a real case ended with "0.00 EUR, some prices are unknown". Decision: a rough estimate is enough, no live retailer search
---
# ITM-272 The plan shows an estimated cost, with price estimates where the catalogue has no price

**REGISTER**

## Outcome

For each material the AI gives a rough price range in euro for the whole quantity (or none when it cannot tell). When no offer of the catalogue fits, the cost estimate uses this range and marks it as an estimate. The total of an option is a range when some price is an estimate, and it is shown on the plan page and on the materials page. The budget check is careful: within the budget only when the upper end fits, over the budget only when even the lower end does not, otherwise "may exceed budget". The AI names no shop and no link.

## Acceptance

- A material without a catalogue offer but with an estimate adds its range to the total; an offer of the catalogue wins over the estimate; a material with neither keeps "some prices are unknown".
- The plan page shows "Estimated cost" for the shown option, as a range marked "an estimate, please check the prices" when estimates are used.
- The prompt asks for the range and forbids shops and links; the prompt version is raised.

## Priority

Should: without it every real case ends without a cost. The prices stay estimates; a real retailer search is a separate, later item.
