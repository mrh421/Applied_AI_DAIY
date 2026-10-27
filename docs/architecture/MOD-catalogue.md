---
id: MOD-catalogue
title: Sample catalogue and search by spec
folder: prototype/src/catalogue/
realises:
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
  - RENT-OR-BORROW-HINT
  - REDIRECT-TO-SELLER
  - 3D-MODEL-SUGGESTION
  - 3D-MODEL-DETAILS
  - 3D-MODEL-LINK
  - NO-PRINTED-SAFETY-PARTS
  - SUGGESTIONS-ONLY-FOR-MISSING
follows:
  - ARC-005
  - ARC-018
uses:
  - MOD-link-check.checkLink
  - MOD-case-model.PartSpec
  - MOD-case-model.Quantity
  - MOD-case-model.Money
  - MOD-case-model.ToolNeed
  - MOD-case-model.MaterialNeed
provides:
  - Certainty
  - Datum
  - Offer
  - ModelEntry
  - CATALOGUE_IS_SAMPLE
  - searchOffers
  - toolHint
  - searchModels
  - printedPartNote
---
# MOD-catalogue Sample catalogue and search by spec

## Responsibility

It belongs to Materials and offers (ARC-005). It holds the sample catalogue of new products, second-hand listings and 3D models, and finds the entries that meet the concrete requirements of a needed item.

## Parts

- `index.ts`: the interface.
- `data/products.json`, `data/listings.json`, `data/models.json` (ARC-018).
- `schema.ts`: the zod schemas of the data.
- `spec-match.ts`: the one matcher for products and models. A stated requirement must be met. Dimensions match within ±2 percent, or ±1 mm for values under 50 mm.
- `offers.ts`, `models.ts`, `hints.ts`.
- `*.test.ts`: unit tests. The data files match the schema; every `verified` datum has a source; the search by spec includes matches and excludes misses; second-hand offers come first; models with incomplete data or unreachable links are excluded; nothing is suggested for safety-critical or unclear parts.

## Data

The three JSON files, each entry in the form of `Offer` or `ModelEntry`, every datum in the form of `Datum` (ARC-018).

## Interfaces

- `Certainty` — `'verified' | 'ai-estimate' | 'unverified'`.
- `Datum<T>` — `{ certainty: 'verified'; value: T; source: string } | { certainty: 'ai-estimate' | 'unverified'; value: T | null }`.
- `Offer` — `{ id: string; title: string; condition: 'new' | 'second-hand'; unitPrice: Datum<Money>; packSize: Quantity; spec: { dimensionsMm: Datum<PartSpec['dimensionsMm']>; material: Datum<string>; function: Datum<string> }; compatibility: Datum<'fits'>; availability: Datum<'in-stock' | 'limited' | 'out-of-stock'>; dataAsOf: string; source: { name: string; url: string }; sellerUrl: string; sustainabilityReason: string | null }`.
- `ModelEntry` — `{ id: string; title: string; spec: PartSpec; dimensionsMm: NonNullable<PartSpec['dimensionsMm']>; materialRequirements: string; licence: string; intendedUse: string; url: string; provider: string }`.
- `CATALOGUE_IS_SAMPLE: true` — the whole catalogue is sample data.
- `searchOffers(item: { name: string; spec?: PartSpec }, missing: Quantity): { offers: Offer[]; noMatch: boolean }` — excludes an offer that fails a stated requirement, and treats an `unverified` value as not meeting it; orders all second-hand offers before all new ones, and by unit price within each group; gives `noMatch` when nothing remains.
- `toolHint(need: ToolNeed): string | null` — the rent-or-borrow hint when `need.rentable` is set.
- `searchModels(need: MaterialNeed): Promise<ModelEntry[]>` — an empty list when the part is not printable or `safetyCritical` is not `no`; otherwise the matching models that have complete data and a link that `checkLink` reports reachable.
- `printedPartNote(need: MaterialNeed): string | null` — for a printable part with `safetyCritical` `yes`, the note that a printed part is recommended only together with a professional review.

**Errors a caller handles:** none. `searchModels` never rejects; a failed link check excludes the model.

## Files

It reads its three JSON files under `prototype/src/catalogue/data/`, which are bundled at build time.

## Uses

- `MOD-link-check.checkLink` — whether a model's link is reachable.
- `MOD-case-model.PartSpec`, `MOD-case-model.Quantity`, `MOD-case-model.Money`, `MOD-case-model.ToolNeed` and `MOD-case-model.MaterialNeed` — the requirements it matches and the values it gives.
