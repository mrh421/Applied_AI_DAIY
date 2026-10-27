---
id: ARC-005
title: Subsystem Materials and offers
refines: ARC-001
forced_by:
  - MATERIALS-LIST
  - MATERIALS-MATCHED-TO-INVENTORY
  - INVENTORY-GROUNDING
  - PARTLY-AVAILABLE
  - OWN-STOCK-FIRST
  - SUGGESTIONS-ONLY-FOR-MISSING
  - MISSING-TOOLS-SEPARATE
  - RENT-OR-BORROW-HINT
  - TOOL-INVENTORY
  - SAMPLE-PRODUCT-DATA
  - PRODUCT-MATCHING-BY-SPEC
  - SECOND-HAND-OFFERS
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
  - REDIRECT-TO-SELLER
  - NO-IN-APP-PURCHASE
  - 3D-MODEL-SUGGESTION
  - 3D-MODEL-LINK
  - 3D-MODEL-DETAILS
  - NO-PRINTED-SAFETY-PARTS
  - TOTAL-COST-ESTIMATE
  - BUDGET-RESPECTED
  - UNCHECKED-PRICE-OR-FIT-MARKED
  - UC-005
  - UC-006
  - UC-007
  - UC-008
designs:
  - MOD-stock-matching
  - MOD-catalogue
  - MOD-link-check
  - MOD-cost-estimate
---
# ARC-005 Subsystem Materials and offers

## Context

From a guide, the user needs four things:

- a materials list matched against the inventory (UC-005);
- offers for what is missing, with comparison data, certainty labels and seller links (UC-006);
- 3D models for printable parts (UC-007);
- cost estimates against a budget (UC-008).

The availability marks must rest on the inventory and not on the model (INVENTORY-GROUNDING). The offers come from sample data (SAMPLE-PRODUCT-DATA), and products are matched by spec (PRODUCT-MATCHING-BY-SPEC).

## Decision

**Responsibility:** Materials and offers decides deterministically what the user holds, what is missing, what can be bought, borrowed or printed, and what it costs. The AI takes no part. Its inputs are the validated guide and the inventory.

**Interface it offers:**

- `matchStock(guides, inventory): StockMatch` (MOD-stock-matching);
- `searchOffers(item, missing)`, `toolHint(need)`, `searchModels(need)` and `printedPartNote(need)` (MOD-catalogue);
- the server function `checkLink({url})` (MOD-link-check), used only by MOD-catalogue;
- `estimateCosts(options, budget)` (MOD-cost-estimate).

**Modules:**

| Module | Responsibility | Runs on |
|---|---|---|
| MOD-stock-matching | Bill of materials and tools against the inventory: available, partly available or missing, and the missing tools apart | client |
| MOD-catalogue | The sample catalogue of new products, second-hand listings and 3D models, and the search in it by spec | client |
| MOD-link-check | Whether a 3D-model link from the catalogue is reachable | server |
| MOD-cost-estimate | Total cost per option, the budget comparison, and the prices and fits still to check | client |

The relations:

- MOD-cost-estimate uses MOD-stock-matching and MOD-catalogue.
- MOD-catalogue uses MOD-link-check.
- MOD-stock-matching uses the item types of MOD-inventory.
- All of them use MOD-case-model.

The data that crosses boundaries is defined in MOD-stock-matching (`StockMatch`), MOD-catalogue (`Offer`, `ModelEntry`, `Datum`) and MOD-cost-estimate (`OptionCost`).

The safety-critical status of a part comes from the Case domain, which treats an unclear status as safety-critical. This subsystem only obeys it.

**Principles:** deterministic code below the AI boundary; DRY, one spec matcher serves products and models; open for extension, real sources later; KISS.

## Alternatives

- **Let the AI mark availability and propose products.** Rejected: INVENTORY-GROUNDING and PRODUCT-MATCHING-BY-SPEC need exact comparisons, and the AI would invent products outside the sample data.
- **Run the catalogue search on the server.** Rejected: the sample data is static and small, and the inventory is on the device. A server round trip adds latency and moves inventory data off the device for no gain (KISS).
- **Check 3D-model links from the browser.** Rejected: cross-origin rules block reading the response of most provider pages. The server check also stays limited to catalogue URLs.

## Consequences

- Replacing the sample data by retailer integrations later changes MOD-catalogue only. Its `searchOffers` interface stays.
- Unit compatibility is limited to the units of MOD-case-model. An item in an incompatible unit counts as missing, which is the conservative reading of INVENTORY-GROUNDING.
