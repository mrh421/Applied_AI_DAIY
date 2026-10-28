---
id: ITM-236
title: Every option shows its total cost
level: module
realises:
  - TOTAL-COST-ESTIMATE
  - UNCHECKED-PRICE-OR-FIT-MARKED
  - UNVERIFIED-COMPATIBILITY-UNCERTAIN
  - OWN-STOCK-FIRST
modules:
  - MOD-cost-estimate
builds_on:
  - ITM-207
  - ITM-226
  - ITM-232
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-cost-estimate.md
---
# ITM-236 Every option shows its total cost

**REGISTER**

## Outcome

`prototype/src/cost-estimate/` offers `estimateCosts(options, match, offers)`: a total per option, counting own stock at zero, with each line whose price or fit is not verified marked. ITM-203 then adds `planMaterials` on top of it.

## Acceptance

- Unit tests: own stock costs nothing; an option with an unverified price is marked; totals add up in cents.

## Priority

Must (from SUS-07), planned for sprint 7 of the sprint split (docs/sprint-split.md)
