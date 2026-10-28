---
id: ITM-238
title: Screens for the profile, the inventory and the history
level: module
realises:
  - SKILL-PROFILE
  - MATERIAL-INVENTORY
  - TOOL-INVENTORY
  - PROJECT-HISTORY
  - DATA-RECTIFICATION
  - CLEAR-LABELS
  - UC-021
modules:
  - MOD-data-screens
builds_on:
  - ITM-223
  - ITM-224
  - ITM-225
  - ITM-212
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-data-screens.md
---
# ITM-238 Screens for the profile, the inventory and the history

**REGISTER**

## Outcome

`ProfileScreen`, `InventoryScreen` and `HistoryScreen` in `prototype/src/data-screens/` show and edit the stored levels, materials, tools and projects with labelled fields; a corrected value replaces the old one.

## Acceptance

- Component tests: a changed level is shown after reload; an inventory entry with an error names the field; a corrected entry keeps no old value.
- Postcondition of UC-021: the corrected values are stored and shown, and the old values no longer remain.

## Priority

Must (from FR-10, FR-11, FR-12, FR-13, NFR-07), planned for sprint 4 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 3; it is planned for sprint 4 because it builds on ITM-224, planned for sprint 4. Until then the prototype's code serves sprint 3.
