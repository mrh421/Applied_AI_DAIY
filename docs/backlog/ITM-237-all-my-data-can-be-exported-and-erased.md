---
id: ITM-237
title: All my data can be exported and erased
level: module
realises:
  - DATA-EXPORT
  - DELETE-ALL-DATA
  - UC-022
  - UC-023
modules:
  - MOD-data-portability
builds_on:
  - ITM-218
  - ITM-210
  - ITM-223
  - ITM-224
  - ITM-225
  - ITM-214
  - ITM-229
  - ITM-233
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-data-portability.md
---
# ITM-237 All my data can be exported and erased

**REGISTER**

## Outcome

`prototype/src/data-portability/` offers `exportAll()`, a JSON file with profile, inventory and history (and the account data when signed in), and `eraseAll()`, which clears the device, the consents, the synced data and the account and reports what it removed.

## Acceptance

- Unit tests: the export validates against its schema and leaves the stored data unchanged; after `eraseAll` no collection, consent or account row remains.
- Postconditions of UC-022 and UC-023.

## Priority

Should (from FR-08, NFR-10), planned for sprint 9 or later, after the cut decision (docs/sprint-split.md)
