---
id: ITM-207
title: The case model holds the schemas and types of a case
level: module
realises:
  - INSTRUCTION-STRUCTURE
  - WORK-PACKAGES
  - PACKAGE-LABEL
  - OUTPUT-FORMAT-CHECK
  - REPAIR-FIRST
  - REUSE-FIRST
  - PERSON-FURNITURE-LOAD-QUESTION
  - PERSON-FURNITURE-DIMENSION-QUESTION
modules:
  - MOD-case-model
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-model.md
---
# ITM-207 The case model holds the schemas and types of a case

**REGISTER**

## Outcome

`prototype/src/case-model/` holds the zod schemas and types of a case that `lib/repair.schema.ts` holds today: the request, the follow-up questions with their fixed topics, the guide with diagnosis, tools, materials, numbered steps, time and warnings, the work packages with their four labels and `stricterLabel`, the escalation, and `rankOptions`, which puts repair and reuse before buying new. `index.ts` is the only entry; the other modules import from it.

## Acceptance

- Unit tests beside the module: a guide without one of its six parts fails the schema; `stricterLabel` orders the four labels; `rankOptions` lists repair, then reuse, then new; the fixed topics include load and dimensions for furniture that carries a person.
- `lib/repair.schema.ts` keeps no schema or type (the hazard and enforcement code moves with ITM items of their modules), and the build passes.

## Priority

Must (from FR-03, FR-05, FR-14, SAF-03), planned for sprint 1 of the sprint split (docs/sprint-split.md)
