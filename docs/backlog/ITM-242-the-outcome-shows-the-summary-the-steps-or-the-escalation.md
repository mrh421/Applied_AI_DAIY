---
id: ITM-242
title: The outcome shows the summary, the steps or the escalation
level: module
realises:
  - PROBLEM-SUMMARY
  - INSTRUCTION-STRUCTURE
  - NUMBERED-STEPS
  - BASICS-EXPANDABLE
  - ILLUSTRATIVE-IMAGES
  - TEXT-ALTERNATIVES
  - ESCALATION-REASON
  - HAZARD-PROFESSIONAL
  - UNDERSTANDABLE-ERROR-NOTICE
  - UC-003
  - UC-011
modules:
  - MOD-case-screens
builds_on:
  - ITM-241
  - ITM-209
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-screens.md
---
# ITM-242 The outcome shows the summary, the steps or the escalation

**REGISTER**

## Outcome

`OutcomeScreen` (from `components/repair/Result.tsx`) shows the problem summary, the guide with diagnosis, tools, materials, numbered steps, time and warnings, collapsed basics that can always be expanded, and the illustrations with their alternatives; or the escalation with its risk, reason, actions and professional and no steps; or an understandable notice.

## Acceptance

- Component tests: all six parts of a guide are shown; an escalation shows no step; collapsed basics open; an AI error shows the notice.
- Postconditions of UC-003 and UC-011: a validated answer or a notice, and an escalation with reason, professional, actions and risk level instead of instructions.

## Priority

Must (from AIR-01, AIR-07, FR-03, FR-05, FR-14, NFR-02, NFR-04, NFR-05, NFR-09, SAF-01, SAF-02, SAF-03, SAF-06), planned for sprint 4 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 1; it is planned for sprint 4 because it builds on ITM-241, planned for sprint 4. Until then the prototype's code serves sprint 1.
