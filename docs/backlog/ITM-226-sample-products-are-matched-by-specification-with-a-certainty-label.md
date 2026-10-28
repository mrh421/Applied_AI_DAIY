---
id: ITM-226
title: Sample products are matched by specification with a certainty label
level: module
realises:
  - SAMPLE-PRODUCT-DATA
  - PRODUCT-MATCHING-BY-SPEC
  - DATA-CERTAINTY-LABELS
  - VERIFIED-DATA-SOURCE
  - UNVERIFIED-COMPATIBILITY-UNCERTAIN
  - NO-UNSUPPORTED-PRODUCT-CLAIMS
  - SUGGESTIONS-ONLY-FOR-MISSING
modules:
  - MOD-catalogue
builds_on:
  - ITM-207
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-catalogue.md and ARC-018
---
# ITM-226 Sample products are matched by specification with a certainty label

**REGISTER**

## Outcome

`lib/offers.ts` becomes `prototype/src/catalogue/` with its data in `prototype/data/catalogue/*.json` (ARC-018), marked as sample data. `searchOffers(part)` matches by dimensions, material and function, and every datum carries a certainty: verified with its source, estimated, or unverified; compatibility that is not verified is stated as uncertain. Offers are searched only for missing items.

## Acceptance

- Unit tests: a part without a match gives no offer; a datum without a source is never `verified`; unverified compatibility reads as uncertain; `CATALOGUE_IS_SAMPLE` is true.

## Priority

Must (from AIR-05, AIR-06, FR-04, SAF-05), planned for sprint 7 of the sprint split (docs/sprint-split.md)
