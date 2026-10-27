---
id: MOD-cost-estimate
title: Costs and budget
folder: prototype/src/cost-estimate/
realises:
  - TOTAL-COST-ESTIMATE
  - BUDGET-RESPECTED
  - UNCHECKED-PRICE-OR-FIT-MARKED
  - UNVERIFIED-COMPATIBILITY-UNCERTAIN
  - OWN-STOCK-FIRST
  - UC-008
follows:
  - ARC-005
uses:
  - MOD-stock-matching.StockMatch
  - MOD-catalogue.Offer
  - MOD-catalogue.searchOffers
  - MOD-case-model.Money
provides:
  - CostLine
  - OptionCost
  - estimateCosts
---
# MOD-cost-estimate Costs and budget

## Responsibility

It belongs to Materials and offers (ARC-005). It computes the estimated total cost of each option, compares it with a stated budget, and lists the prices and fits that still need checking (UC-008 A1 to A4).

## Parts

- `index.ts`: the interface.
- `estimate.ts`: the computation.
- `*.test.ts`: unit tests. The total equals the sum of the item prices; own stock adds nothing; pack rounding; within and exceeding the budget, and no budget; unverified lines are marked.

## Data

It keeps nothing. The rules:

- A line from own stock costs 0.
- A missing or partly available line costs ceil(missing ÷ pack size) × unit price of the chosen offer. The chosen offer defaults to the cheapest from `searchOffers`.
- A line without an offer has `amount` `null` and makes the total `incomplete`.
- `priceToCheck` marks a price that is not `verified`, and `fitToCheck` marks a compatibility that is not `verified`.
- The total is the sum of the line amounts.
- With a budget, each option is `within` or `exceeds`. `noneWithinBudget` is set when no option is within.

## Interfaces

- `CostLine` — `{ name: string; amount: Money | null; fromOwnStock: boolean; priceToCheck: boolean; fitToCheck: boolean }`.
- `OptionCost` — `{ optionId: string; total: Money; incomplete: boolean; lines: CostLine[]; budget: 'within' | 'exceeds' | 'no-budget' }`.
- `estimateCosts(options: { optionId: string; match: StockMatch; chosen: Record<string, Offer | null> }[], budget: Money | null): { costs: OptionCost[]; noneWithinBudget: boolean }` — the costs by the rules under Data.

**Errors a caller handles:** none.

## Files

It reads and writes no file.

## Uses

- `MOD-stock-matching.StockMatch` — what is held and what is missing.
- `MOD-catalogue.Offer` and `MOD-catalogue.searchOffers` — the prices, and the default offer.
- `MOD-case-model.Money` — the amounts.
