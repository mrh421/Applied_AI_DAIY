---
id: MOD-inventory
title: Material and tool inventory
folder: prototype/src/inventory/
realises:
  - MATERIAL-INVENTORY
  - TOOL-INVENTORY
  - INVENTORY-ON-DEVICE
  - DEDUCT-CONSUMED
  - OFFER-SAVE-OWNED-ITEMS
  - DATA-RECTIFICATION
  - ERROR-IDENTIFICATION
  - INPUT-USES-INVENTORY
follows:
  - ARC-006
uses:
  - MOD-local-store.localStore
  - MOD-case-model.Quantity
  - MOD-case-model.Unit
  - MOD-case-model.InventorySnapshot
provides:
  - MaterialItem
  - ToolItem
  - MaterialInput
  - InventoryFieldError
  - listMaterials
  - saveMaterial
  - removeMaterial
  - listTools
  - saveTool
  - removeTool
  - deduct
  - snapshot
  - useInventory
---
# MOD-inventory Material and tool inventory

## Responsibility

It belongs to Personal data (ARC-006). It stores the materials and tools the user owns, validates new entries and deducts consumed quantities.

## Parts

- `index.ts`: the interface.
- `materials.ts`, `tools.ts`, `validate.ts`.
- `*.test.ts`: unit tests. Save with and without a location; each missing field is named; change and remove; `deduct` with more than held clamps to 0; `snapshot`; the data persists across reload.

## Data

Materials in the collection `materials` and tools in the collection `tools` of MOD-local-store. Validation: `name` must be non-empty; `amount` must be a number ≥ 0; `unit` must be one of the units of MOD-case-model; `location` is optional. Each error names its field.

## Interfaces

- `MaterialItem` — `{ id: string; name: string; quantity: Quantity; location?: string }`.
- `ToolItem` — `{ id: string; name: string }`.
- `MaterialInput` — `{ name: string; amount: number | null; unit: Unit | null; location?: string }`.
- `InventoryFieldError` — `{ field: 'name' | 'amount' | 'unit'; message: string }`.
- `listMaterials(): MaterialItem[]` — every material.
- `saveMaterial(input: MaterialInput, id?: string): { ok: true; item: MaterialItem } | { ok: false; errors: InventoryFieldError[] }` — adds or changes a material.
- `removeMaterial(id: string): void` — removes a material.
- `listTools(): ToolItem[]` — every tool.
- `saveTool(name: string, id?: string): { ok: true; item: ToolItem } | { ok: false; errors: InventoryFieldError[] }` — adds or changes a tool.
- `removeTool(id: string): void` — removes a tool.
- `deduct(used: { itemId: string; amount: number }[]): MaterialItem[]` — returns the changed items; never below 0.
- `snapshot(): InventorySnapshot` — what a case request carries.
- `useInventory(): { materials: MaterialItem[]; tools: ToolItem[] }` — the inventory as a React hook.

**Errors a caller handles:** field errors in the result; `StorageFullError` from MOD-local-store, passed on.

## Files

Through MOD-local-store only, the keys `daiy.v1.materials` and `daiy.v1.tools`.

## Uses

- `MOD-local-store.localStore` — reading and writing the items.
- `MOD-case-model.Quantity`, `MOD-case-model.Unit` and `MOD-case-model.InventorySnapshot` — quantities, units and the snapshot.
