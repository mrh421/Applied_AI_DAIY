---
id: ITM-232
title: The materials list is matched against own stock
level: module
realises:
  - MATERIALS-LIST
  - MATERIALS-MATCHED-TO-INVENTORY
  - INVENTORY-GROUNDING
  - PARTLY-AVAILABLE
  - OWN-STOCK-FIRST
  - MISSING-TOOLS-SEPARATE
  - TOOL-INVENTORY
  - UC-005
modules:
  - MOD-stock-matching
builds_on:
  - ITM-207
  - ITM-224
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-stock-matching.md
---
# ITM-232 The materials list is matched against own stock

**REGISTER**

## Outcome

`prototype/src/stock-matching/` offers `matchStock(guide, snapshot)`: each material of the steps is available only when the inventory holds a sufficient quantity, partly available with the missing quantity, or missing; missing tools are listed apart.

## Acceptance

- Unit tests: an item with too little quantity is partly available, never available; units are compared, not names alone; tools are separate; an empty inventory marks all missing without error.
- Postcondition of UC-005: only items held in sufficient quantity are marked "available", with the missing quantities and a separate list of missing tools.

## Priority

Must (from AIR-09, FR-04, FR-12, SUS-07), planned for sprint 6 of the sprint split (docs/sprint-split.md)
