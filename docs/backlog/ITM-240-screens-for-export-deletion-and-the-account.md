---
id: ITM-240
title: Screens for export, deletion and the account
level: module
realises:
  - DATA-EXPORT
  - DELETE-ALL-DATA
  - ACCOUNT-SYNC
  - PASSWORDS-HASHED
  - ACCESSIBLE-AUTHENTICATION
  - USE-WITHOUT-ACCOUNT
  - STATUS-MESSAGES
  - UC-022
  - UC-023
modules:
  - MOD-data-screens
builds_on:
  - ITM-239
  - ITM-237
  - ITM-214
  - ITM-233
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-data-screens.md
---
# ITM-240 Screens for export, deletion and the account

**REGISTER**

## Outcome

The privacy screen exports all data as a file and erases all data after one confirmation; `AccountScreen` signs up and in with a passkey or a password and shows the sync state. No screen requires an account. ITM-202 later moves the account screen out of this module.

## Acceptance

- Component tests: export downloads a file; erase asks once and then leaves nothing; sign-in offers a passkey and a password without a CAPTCHA; the sync state is announced.
- Postconditions of UC-022 and UC-023.

## Priority

Should (from FR-08, NFR-10), planned for sprint 5 of docs/Implementation_Plan_EN.md
