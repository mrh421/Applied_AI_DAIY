---
id: ITM-250
title: The AI access subsystem works as one
level: subsystem
realises:
  - NO-ASSUMPTIONS-AS-FACTS
  - UC-001
  - UC-003
modules:
  - MOD-ai-tasks
  - MOD-ai-gateway
integrates: ARC-003
builds_on:
  - ITM-222
  - ITM-208
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-003-ai-access-subsystem.md
---
# ITM-250 The AI access subsystem works as one

**REGISTER**

## Outcome

The AI tasks call the gateway against a stub server with recorded drafts; the assessment, explanation and step answer each round-trip through the structured output.

## Acceptance

- Component test `prototype/src/test/ai-access.test.ts` against the stub of `prototype/tests/system/ai-stub/`: each task returns a schema-valid draft, and each error code reaches the caller.
- Postcondition of UC-003: no AI output reached the user without validation (the caller receives only typed drafts or errors).

## Priority

Must (from AIR-01, AIR-02, AIR-07, FR-01, FR-03, FR-05, NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-09, SAF-03, SAF-06), planned for sprint 3 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 1; it is planned for sprint 3 because it builds on ITM-222, planned for sprint 3. Until then the prototype's code serves sprint 1.
