---
id: ITM-245
title: The materials list shows own stock first
level: module
realises:
  - MATERIALS-LIST
  - PARTLY-AVAILABLE
  - OWN-STOCK-FIRST
  - MISSING-TOOLS-SEPARATE
  - SUGGESTIONS-ONLY-FOR-MISSING
  - SAMPLE-PRODUCT-DATA
  - DATA-CERTAINTY-LABELS
  - VERIFIED-DATA-SOURCE
  - NO-UNSUPPORTED-PRODUCT-CLAIMS
  - OFFER-SAVE-OWNED-ITEMS
  - DEDUCT-CONSUMED
  - UC-005
  - UC-009
  - UC-015
modules:
  - MOD-materials-screens
builds_on:
  - ITM-235
  - ITM-232
  - ITM-226
  - ITM-224
  - ITM-212
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-materials-screens.md
---
# ITM-245 The materials list shows own stock first

**REGISTER**

## Outcome

`MaterialsScreen` shows each material with its stock status and missing quantity, the missing tools apart, and sample products with their certainty label only for what is missing, marked as sample data; it offers to save owned items to the inventory, and `DeductDialog` asks which used quantities to deduct.

## Acceptance

- Component tests: an available item shows no offer; a partly available one shows its missing quantity; declining to save blocks nothing; the dialog deducts only confirmed lines.
- Postconditions of UC-005, UC-009 and UC-015.

## Priority

Must (from AIR-06, AIR-09, FR-04, FR-11, FR-12, SAF-05, SUS-07), planned for sprint 4 of docs/Implementation_Plan_EN.md
