---
id: ARC-018
title: Sample catalogue data in the repository
refines: ARC-001
forced_by:
  - SAMPLE-PRODUCT-DATA
  - OFFER-COMPARISON
  - OFFER-AVAILABILITY
  - OFFER-FRESHNESS
  - OFFER-DATA-SOURCE-SHOWN
  - DATA-CERTAINTY-LABELS
  - VERIFIED-DATA-SOURCE
  - SECOND-HAND-OFFERS
  - NO-UNSUPPORTED-PRODUCT-CLAIMS
  - SUSTAINABILITY-EXPLAINED
  - 3D-MODEL-DETAILS
  - 3D-MODEL-LINK
  - UC-006
  - UC-007
---
# ARC-018 Sample catalogue data in the repository

## Context

The product search works on sample product data (SAMPLE-PRODUCT-DATA), and UC-006 A6 shows it as sample data, not as live prices. The data must still support every comparison requirement:

- price, condition, dimensions and compatibility (OFFER-COMPARISON);
- availability and freshness (OFFER-AVAILABILITY, OFFER-FRESHNESS);
- data source and certainty labels (OFFER-DATA-SOURCE-SHOWN, DATA-CERTAINTY-LABELS, VERIFIED-DATA-SOURCE);
- second-hand offers, without claims that lack evidence (SECOND-HAND-OFFERS, NO-UNSUPPORTED-PRODUCT-CLAIMS);
- supported sustainability reasons (SUSTAINABILITY-EXPLAINED).

UC-007 needs 3D models with dimensions, material requirements, licence, intended use and a link (3D-MODEL-DETAILS, 3D-MODEL-LINK).

## Decision

- **Files:** the catalogue is three JSON files inside `prototype/data/catalogue/`, a folder that belongs to no module, so that MOD-catalogue and MOD-link-check can both read them without importing from each other's folder: `products.json` for new offers, `listings.json` for second-hand offers and `models.json` for 3D models. Each is validated against MOD-catalogue's zod schema by a unit test.
- **Datum form:** every datum is stored in the `Datum` form of MOD-catalogue. A datum labelled `verified` has a source, and a second-hand listing without evidence has the value `null` with the label `unverified`.
- **Per-offer fields:** every offer carries `dataAsOf`, `source` and `sellerUrl`. A sustainability reason is a sentence without a CO₂ figure, unless the figure carries a source.
- **Display:** the User interface marks the whole catalogue as sample data.

**Principles:** separate data and code; open for extension, the same interface serves real sources later; KISS.

## Alternatives

| Alternative | Why not |
|---|---|
| Retailer or marketplace APIs | Not in MVP scope (SAMPLE-PRODUCT-DATA). They can later replace the files behind `searchOffers` and `searchModels`. |
| Scraping second-hand platforms | Legal and reliability risks, and data freshness the app could not vouch for. |
| A database table for the catalogue | Static data needs no database (KISS). |
| A TypeScript literal, as in the prototype's `offers.ts` | Mixes data and code. JSON with a schema test keeps the data editable and checked. |

## Consequences

- Adding sample entries needs no code change.
- Prices and freshness are as of `dataAsOf`, which the UI shows.
