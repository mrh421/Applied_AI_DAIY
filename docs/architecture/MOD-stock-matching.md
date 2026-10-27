---
id: MOD-stock-matching
title: Materials and tools against the inventory
folder: prototype/src/stock-matching/
realises:
  - MATERIALS-LIST
  - MATERIALS-MATCHED-TO-INVENTORY
  - INVENTORY-GROUNDING
  - PARTLY-AVAILABLE
  - OWN-STOCK-FIRST
  - SUGGESTIONS-ONLY-FOR-MISSING
  - MISSING-TOOLS-SEPARATE
  - TOOL-INVENTORY
  - SETUP-NEVER-BLOCKS
follows:
  - ARC-005
uses:
  - MOD-case-model.Guide
  - MOD-case-model.MaterialNeed
  - MOD-case-model.ToolNeed
  - MOD-case-model.Quantity
  - MOD-case-model.Unit
  - MOD-inventory.MaterialItem
  - MOD-inventory.ToolItem
provides:
  - StockStatus
  - MaterialMatch
  - ToolMatch
  - StockMatch
  - matchStock
---
# MOD-stock-matching Materials and tools against the inventory

## Responsibility

It belongs to Materials and offers (ARC-005). It derives the bill of materials and the tool list of an option from its guides, and matches them against the inventory.

## Parts

- `index.ts`: the interface.
- `bill.ts`: aggregates the same material across the packages of an option.
- `units.ts`: conversion within length (mm, cm, m), volume (ml, l) and mass (g, kg). Area and pieces are not converted.
- `match.ts`: the matching.
- `*.test.ts`: unit tests. Quantities below, equal to and above the requirement; unit conversion, and an incompatible unit; aggregation across packages; missing tools apart; an empty inventory.

## Data

It keeps nothing. The matching rules:

- Names match after trimming and case folding.
- A held quantity in a compatible unit is converted. held ≥ required gives `available`; 0 < held < required gives `partly-available` with `missing` = required − held; otherwise, including an incompatible unit, `missing` with the full quantity.
- `materials` lists available items first, then partly available, then missing (OWN-STOCK-FIRST).
- Tools are split into owned and missing.
- An empty guide list gives empty lists.

## Interfaces

- `StockStatus` — `{ kind: 'available' } | { kind: 'partly-available'; missing: Quantity } | { kind: 'missing'; missing: Quantity }`.
- `MaterialMatch` — `{ need: MaterialNeed; inventoryItemId: string | null; held: Quantity | null; status: StockStatus }`.
- `ToolMatch` — `{ need: ToolNeed; inventoryToolId: string | null }`.
- `StockMatch` — `{ materials: MaterialMatch[]; ownedTools: ToolMatch[]; missingTools: ToolMatch[] }`.
- `matchStock(guides: Guide[], inventory: { materials: MaterialItem[]; tools: ToolItem[] }): StockMatch` — the match by the rules under Data.

**Errors a caller handles:** none. The function is total.

## Files

It reads and writes no file.

## Uses

- `MOD-case-model.Guide`, `MOD-case-model.MaterialNeed`, `MOD-case-model.ToolNeed`, `MOD-case-model.Quantity` and `MOD-case-model.Unit` — the needs and quantities it matches.
- `MOD-inventory.MaterialItem` and `MOD-inventory.ToolItem` — the inventory items it matches against.
