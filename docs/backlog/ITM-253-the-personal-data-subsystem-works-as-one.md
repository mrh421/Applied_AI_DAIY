---
id: ITM-253
title: The Personal data subsystem works as one
level: subsystem
realises:
  - UC-009
  - UC-013
  - UC-014
  - UC-015
  - UC-016
  - UC-020
modules:
  - MOD-local-store
  - MOD-consent
  - MOD-profile
  - MOD-inventory
  - MOD-history
integrates: ARC-006
builds_on:
  - ITM-218
  - ITM-210
  - ITM-223
  - ITM-224
  - ITM-225
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-006-personal-data-subsystem.md
---
# ITM-253 The Personal data subsystem works as one

**REGISTER**

## Outcome

Profile, inventory and history persist on the device through the local store, each only on its basis in the storage register.

## Acceptance

- Component test `prototype/src/test/personal-data.test.ts` with fake-indexeddb: data persists across a reload; withdrawing consent purges its collections; nothing is sent to a server.
- Postcondition of UC-020: only what is strictly necessary or consented is stored or read.

## Priority

Must (from FR-10, FR-11, FR-12, FR-13), planned for sprint 5 of the sprint split (docs/sprint-split.md)

Its requirements belong to sprint 3; it is planned for sprint 4 because it builds on ITM-224, planned for sprint 4. Until then the prototype's code serves sprint 3.
