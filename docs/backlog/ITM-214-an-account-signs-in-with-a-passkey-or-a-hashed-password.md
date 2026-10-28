---
id: ITM-214
title: An account signs in with a passkey or a hashed password
level: module
realises:
  - ACCOUNT-SYNC
  - PASSWORDS-HASHED
  - ACCESSIBLE-AUTHENTICATION
  - PRIVATE-BY-DEFAULT
  - DATA-RECTIFICATION
  - DELETE-ALL-DATA
modules:
  - MOD-accounts
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-accounts.md, ARC-012 and ARC-013
---
# ITM-214 An account signs in with a passkey or a hashed password

**REGISTER**

## Outcome

`prototype/src/accounts/` holds the server side of an account in SQLite (ARC-012): sign-up and sign-in with a passkey (WebAuthn) or a username and a password stored only as a hash, change of username and password, sign-out and deletion of the account; it stores no e-mail address and no field that no function needs, and `requireAccountId` guards every account request.

## Acceptance

- Unit tests with a temporary SQLite file: the stored row holds no plain-text password; a wrong password fails; a passkey round-trip with a test authenticator signs in; deleting removes every row of the account; a request without a session raises `UnauthenticatedError`.
- Sign-in needs no cognitive function test (no CAPTCHA, no transcription).

## Priority

Should (from FR-08, NFR-10), planned for sprint 5 of docs/Implementation_Plan_EN.md
