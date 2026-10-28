---
id: ITM-227
title: Second-hand offers come first and are compared
level: module
realises:
  - SECOND-HAND-OFFERS
  - SECOND-HAND-LISTED-FIRST
  - OFFER-COMPARISON
  - OFFER-DATA-SOURCE-SHOWN
  - OFFER-AVAILABILITY
  - OFFER-FRESHNESS
  - SUSTAINABILITY-EXPLAINED
  - REDIRECT-TO-SELLER
  - RENT-OR-BORROW-HINT
modules:
  - MOD-catalogue
builds_on:
  - ITM-226
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-catalogue.md
---
# ITM-227 Second-hand offers come first and are compared

**REGISTER**

## Outcome

Offers carry price, condition, dimensions, compatibility, availability, the date of their data, their source and the seller's link; second-hand offers are listed before new ones; a sustainability note explains the reuse without a CO2 figure; `toolHint` suggests renting or borrowing a missing tool. A purchase is always at the seller.

## Acceptance

- Unit tests: second-hand before new at equal fit; every offer has a source, a date and a link to the seller; no note contains a CO2 figure.

## Priority

Should (from FR-12, SUS-01, SUS-02, SUS-03, SUS-04, SUS-05), planned for sprint 9 or later, after the cut decision (docs/sprint-split.md)
