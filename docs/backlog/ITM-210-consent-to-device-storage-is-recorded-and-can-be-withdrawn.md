---
id: ITM-210
title: Consent to device storage is recorded and can be withdrawn
level: module
realises:
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - UC-020
modules:
  - MOD-consent
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-consent.md
---
# ITM-210 Consent to device storage is recorded and can be withdrawn

**REGISTER**

## Outcome

`prototype/src/consent/` records one consent per purpose of `CONSENT_PURPOSES` with its time, answers `hasConsent`, and on `withdrawConsent` records the withdrawal and runs the purge registered for that purpose, so that nothing beyond what is strictly necessary is stored or read without a consent.

## Acceptance

- Unit tests: a purpose without consent answers false; giving and withdrawing are recorded with their time; withdrawing runs the registered purge once.
- Postcondition of UC-020: a withdrawn consent is recorded and no longer used.

## Priority

unrated (nothing it realises cites an old id with a MoSCoW row), planned for sprint 1 of docs/Implementation_Plan_EN.md

It realises nothing with a sprint of its own, so it is planned with the earliest item that builds on it.
