---
id: MOD-materials-screens
title: Screens of materials, offers and costs
folder: prototype/src/materials-screens/
realises:
  - MATERIALS-LIST
  - PARTLY-AVAILABLE
  - OWN-STOCK-FIRST
  - MISSING-TOOLS-SEPARATE
  - RENT-OR-BORROW-HINT
  - SUGGESTIONS-ONLY-FOR-MISSING
  - SECOND-HAND-LISTED-FIRST
  - OFFER-COMPARISON
  - OFFER-DATA-SOURCE-SHOWN
  - OFFER-AVAILABILITY
  - OFFER-FRESHNESS
  - DATA-CERTAINTY-LABELS
  - VERIFIED-DATA-SOURCE
  - UNVERIFIED-COMPATIBILITY-UNCERTAIN
  - NO-UNSUPPORTED-PRODUCT-CLAIMS
  - SUSTAINABILITY-EXPLAINED
  - SAMPLE-PRODUCT-DATA
  - REDIRECT-TO-SELLER
  - NO-IN-APP-PURCHASE
  - 3D-MODEL-SUGGESTION
  - 3D-MODEL-DETAILS
  - 3D-MODEL-LINK
  - NO-PRINTED-SAFETY-PARTS
  - TOTAL-COST-ESTIMATE
  - BUDGET-RESPECTED
  - UNCHECKED-PRICE-OR-FIT-MARKED
  - OFFER-SAVE-OWNED-ITEMS
  - DEDUCT-CONSUMED
follows:
  - ARC-008
  - ARC-005
uses:
  - MOD-ui-kit.Button
  - MOD-ui-kit.LinkButton
  - MOD-ui-kit.TextField
  - MOD-ui-kit.Checkbox
  - MOD-ui-kit.StatusBadge
  - MOD-ui-kit.Dialog
  - MOD-ui-kit.Page
  - MOD-ui-kit.announce
  - MOD-case-session.useCaseSession
  - MOD-stock-matching.matchStock
  - MOD-catalogue.searchOffers
  - MOD-catalogue.toolHint
  - MOD-catalogue.searchModels
  - MOD-catalogue.printedPartNote
  - MOD-catalogue.CATALOGUE_IS_SAMPLE
  - MOD-cost-estimate.estimateCosts
  - MOD-inventory.useInventory
  - MOD-inventory.saveMaterial
  - MOD-inventory.saveTool
  - MOD-case-model.Money
provides:
  - MaterialsScreen
  - OffersScreen
  - DeductDialog
---
# MOD-materials-screens Screens of materials, offers and costs

## Responsibility

It belongs to the User interface (ARC-008). It presents the materials and tools of a case against the inventory, offers and 3D models for what is missing, costs against a budget, saving owned items, and deducting used materials.

## Parts

- `index.ts`: the interface.
- `MaterialsScreen`: own stock first; the status of each item as text with an icon: available, partly available with the missing quantity, or missing; a separate list of missing tools with the rent-or-borrow hint; an `I own this` choice per listed item, and then an offer to save these items to the inventory, which can be declined or ignored; nothing is shown when no materials are needed; a Complete project action that opens `DeductDialog`.
- `OffersScreen`: the sample-data notice; offers as cards, second-hand first, each with price, condition, dimensions, compatibility, availability, data age, source, the certainty label of each datum, and a sustainability reason where one exists; unverified compatibility shown as `uncertain`, and missing evidence shown as `not stated`; the buy action is a `LinkButton` to `sellerUrl` that opens the seller's page; a 3D-model suggestion with dimensions, material requirements, licence, intended use and the link, or the professional-review note.
- `BudgetPanel`: a budget field, a total per option, `within` or `exceeds budget` as text, and the prices and fits to check.
- `DeductDialog`: on completion, the used quantities, which can be confirmed or corrected, and the new inventory quantities. It can be declined.
- `*.test.tsx`: Testing Library tests. Second-hand offers come before new ones; every datum shows its label, and verified data its source; the buy link points to the seller and nothing is bought in the app; the missing tools appear in their own list; declining to save does not block; deduction clamps at zero.

## Data

None.

## Interfaces

- `MaterialsScreen(p: { caseId: string }): JSX.Element` — the route `/case/$id/materials`.
- `OffersScreen(p: { caseId: string; itemId: string }): JSX.Element` — the route `/case/$id/offers/$itemId`.
- `DeductDialog(p: { caseId: string; open: boolean; onClose: () => void }): JSX.Element` — the deduction on completion; it calls `complete(used)` of `useCaseSession` once and shows its single result.

**Errors a caller handles:** none. An invalid budget or quantity is described in text that names the field.

## Files

It reads and writes no file.

## Uses

- `MOD-ui-kit.Button`, `MOD-ui-kit.LinkButton`, `MOD-ui-kit.TextField`, `MOD-ui-kit.Checkbox`, `MOD-ui-kit.StatusBadge`, `MOD-ui-kit.Dialog`, `MOD-ui-kit.Page` and `MOD-ui-kit.announce` — every element of the screens.
- `MOD-case-session.useCaseSession` — the guides, the budget, the used materials and completion.
- `MOD-stock-matching.matchStock` — the materials list.
- `MOD-catalogue.searchOffers`, `MOD-catalogue.toolHint`, `MOD-catalogue.searchModels`, `MOD-catalogue.printedPartNote` and `MOD-catalogue.CATALOGUE_IS_SAMPLE` — offers, hints, models and the sample-data notice.
- `MOD-cost-estimate.estimateCosts` — the budget panel.
- `MOD-inventory.useInventory`, `MOD-inventory.saveMaterial`, and `MOD-inventory.saveTool` — the inventory and saving owned items. The deduction goes through `complete` of `useCaseSession`.
- `MOD-case-model.Money` — the budget.
