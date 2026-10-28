---
id: ITM-228
title: 3D models are suggested with their details, never for safety parts
level: module
realises:
  - 3D-MODEL-SUGGESTION
  - 3D-MODEL-DETAILS
  - 3D-MODEL-LINK
  - NO-PRINTED-SAFETY-PARTS
modules:
  - MOD-catalogue
builds_on:
  - ITM-226
  - ITM-211
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-catalogue.md
---
# ITM-228 3D models are suggested with their details, never for safety parts

**REGISTER**

## Outcome

`searchModels(part)` suggests a 3D model with its dimensions, material requirements, licence, intended use and a link that `checkLink` found working; `printedPartNote` refuses a printed part for a safety-critical use without professional review.

## Acceptance

- Unit tests: a model without a working link is not suggested; every suggestion has the four details; a safety-critical part gives the note instead of a model.

## Priority

Could (from FR-06, SAF-04, SUS-06), planned for sprint 6 of docs/Implementation_Plan_EN.md
