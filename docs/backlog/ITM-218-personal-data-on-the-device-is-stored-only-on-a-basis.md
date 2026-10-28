---
id: ITM-218
title: Personal data on the device is stored only on a basis
level: module
realises:
  - PROFILE-ON-DEVICE
  - INVENTORY-ON-DEVICE
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - DELETE-ALL-DATA
  - DATA-EXPORT
modules:
  - MOD-local-store
builds_on:
  - ITM-210
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-local-store.md and ARC-015
---
# ITM-218 Personal data on the device is stored only on a basis

**REGISTER**

## Outcome

`prototype/src/local-store/` keeps the collections of profile, inventory and history and the photos in IndexedDB (ARC-015). `STORAGE_REGISTER` names the basis of every collection: strictly necessary, or a consent purpose; a write without its basis raises `ConsentMissingError`, a full device `StorageFullError`. It reads every collection for export and clears them all on request.

## Acceptance

- Unit tests with fake-indexeddb: a write without consent fails; withdrawing a consent purges its collections; clear leaves nothing; a full store raises its error.

## Priority

Must (from FR-08, FR-10, FR-11, NFR-10), planned for sprint 4 of the sprint split (docs/sprint-split.md)
