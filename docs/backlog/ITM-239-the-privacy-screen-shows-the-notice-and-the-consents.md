---
id: ITM-239
title: The privacy screen shows the notice and the consents
level: module
realises:
  - PRIVACY-NOTICE
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - UC-019
  - UC-020
modules:
  - MOD-data-screens
builds_on:
  - ITM-210
  - ITM-212
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-data-screens.md
---
# ITM-239 The privacy screen shows the notice and the consents

**REGISTER**

## Outcome

`PrivacyNotice` (short and full variant) and `PrivacyScreen` in `prototype/src/data-screens/` name the six items of the notice, including what is sent to the AI provider (ARC-010), before any data is collected, and list the consents with give and withdraw. ITM-202 later moves the notice out of this module, ITM-206 adds the legal basis of the transfer.

## Acceptance

- Component tests: both variants show all six items; the short notice is shown before the first case is sent; withdrawing a consent is recorded and announced.
- Postcondition of UC-019: the user was informed of all items of the notice before data was collected.

## Priority

Must (from NFR-06), planned for sprint 1 of docs/Implementation_Plan_EN.md
