---
id: ITM-224
title: Materials and tools are kept in the inventory on the device
level: module
realises:
  - MATERIAL-INVENTORY
  - TOOL-INVENTORY
  - INVENTORY-ON-DEVICE
  - DEDUCT-CONSUMED
  - OFFER-SAVE-OWNED-ITEMS
  - ERROR-IDENTIFICATION
  - UC-014
  - UC-015
modules:
  - MOD-inventory
builds_on:
  - ITM-207
  - ITM-218
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-inventory.md
---
# ITM-224 Materials and tools are kept in the inventory on the device

**REGISTER**

## Outcome

`prototype/src/inventory/` keeps materials with name, quantity, unit and an optional location, and tools, through MOD-local-store. `deduct(confirmed)` lowers the quantities of confirmed materials only; `snapshot()` gives what the AI and the stock matching read; an invalid entry returns an `InventoryFieldError` naming the field.

## Acceptance

- Unit tests with fake-indexeddb: entries persist across a reload; `deduct` lowers only confirmed quantities and never below zero; a missing unit names the field.
- Postconditions of UC-014 and UC-015: every material holds name, quantity, unit and, where given, a location; without a confirmation no quantity changed.

## Priority

Must (from FR-11, FR-12), planned for sprint 4 of docs/Implementation_Plan_EN.md
