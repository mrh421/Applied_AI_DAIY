---
id: ITM-215
title: The pre-check detects hazards in English and German
level: module
realises:
  - RISK-CHECK-FIRST
  - PRECHECK-ENGLISH
  - PRECHECK-GERMAN
  - PRECHECK-SPARES-PROJECT-PACKAGES
  - PRECHECK-COVERS-FOLLOW-UP-ANSWERS
  - NO-ENERGY-RENOVATION-PLANNING
modules:
  - MOD-hazard-precheck
builds_on:
  - ITM-207
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-hazard-precheck.md
---
# ITM-215 The pre-check detects hazards in English and German

**REGISTER**

## Outcome

`prototype/src/hazard-precheck/` holds the catalogue, one entry per `HazardKind` with English and German patterns, and `detectHazards` and `precheck(texts)`, which joins the description and every follow-up answer. Installation work that can be one package of a larger project (a new socket, a ceiling light, a wallbox) is not matched; energy renovation is out of scope. `opensHousing` recognises a step that opens a mains housing.

## Acceptance

- Unit tests, one per kind, each with an English and a German positive and a near-miss negative; the inputs of the classification cases are not blocked; a hazard only in a follow-up answer is found.
- `src/test/safety.test.ts` passes.

## Priority

Must (from FR-14, SAF-01), planned for sprint 1 of docs/Implementation_Plan_EN.md
