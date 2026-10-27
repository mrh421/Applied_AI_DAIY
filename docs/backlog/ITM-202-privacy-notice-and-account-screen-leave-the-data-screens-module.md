---
id: ITM-202
title: The privacy notice and the account screen leave the data-screens module
level: module
realises:
  - PRIVACY-NOTICE
  - UC-018
  - UC-019
modules:
  - MOD-data-screens
  - MOD-case-screens
  - MOD-ui-kit
builds_on: []
tests:
  - component
origin:
  - Sonnet review of the architecture draft, finding m-07 (2026-10-27): MOD-data-screens has five screens, the notice text and the account UI (34 `uses`), and MOD-case-screens depends on it for `PrivacyNotice` only
---
# ITM-202 The privacy notice and the account screen leave the data-screens module

**REGISTER**

## Outcome

`PrivacyNotice` (both variants) is its own module or part of MOD-ui-kit, so that MOD-case-screens no longer imports from a peer screen module. `AccountScreen` is split off MOD-data-screens. The module files and the diagram of ARC-001 change with it.

## Acceptance

- MOD-case-screens imports no other screen module.
- Both variants of the notice still show all six items (a component test), and the account flow of UC-018 is unchanged.
