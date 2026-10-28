---
id: ITM-246
title: Offers are compared with the second-hand ones first
level: module
realises:
  - SECOND-HAND-LISTED-FIRST
  - OFFER-DATA-SOURCE-SHOWN
  - OFFER-AVAILABILITY
  - OFFER-FRESHNESS
  - SUSTAINABILITY-EXPLAINED
  - REDIRECT-TO-SELLER
  - RENT-OR-BORROW-HINT
  - UC-006
modules:
  - MOD-materials-screens
builds_on:
  - ITM-245
  - ITM-227
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-materials-screens.md
---
# ITM-246 Offers are compared with the second-hand ones first

**REGISTER**

## Outcome

`OffersScreen` compares the offers for a missing item by price, condition, dimensions and compatibility, second-hand first, each with availability, data date, source and certainty, and links to the seller; a missing tool shows the rent-or-borrow hint.

## Acceptance

- Component tests: second-hand first; every offer shows source and date; the buy control is an external link.
- Postcondition of UC-006: a purchase, if chosen, was made at the seller, not in the app.

## Priority

Must (from AIR-05, AIR-06, FR-04, FR-12, SAF-05, SUS-01, SUS-02, SUS-03, SUS-04, SUS-05), planned for sprint 5 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 4; it is planned for sprint 5 because it builds on ITM-227, planned for sprint 5. Until then the prototype's code serves sprint 4.
