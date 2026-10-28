---
id: ITM-234
title: A case starts and is clarified in one session
level: module
realises:
  - FREE-TEXT-INPUT
  - OPTIONAL-PHOTO
  - SETUP-NEVER-BLOCKS
  - INPUT-USES-INVENTORY
  - DEFAULT-BEGINNER
  - FOLLOW-UP-QUESTIONS
  - REDUNDANT-ENTRY
  - UNDERSTANDABLE-ERROR-NOTICE
  - UC-002
modules:
  - MOD-case-session
builds_on:
  - ITM-230
  - ITM-223
  - ITM-224
  - ITM-225
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-session.md
---
# ITM-234 A case starts and is clarified in one session

**REGISTER**

## Outcome

`prototype/src/case-session/` holds the state of a case on the client: description, optional photo, the rounds of questions with answers prefilled from what the user already said, the outcome, and the request to the pipeline with the inventory snapshot and the level (beginner when none is set). A missing profile or inventory never blocks the start.

## Acceptance

- Unit tests: the round advances and there is no third round; prefill by topic; the explanation request carries beginner when no level is set; a case starts with an empty profile and inventory.
- Postcondition of UC-002: no assumed detail is presented as a fact, and no information already given had to be entered again.

## Priority

Must (from AIR-02, AIR-07, FR-01, FR-02, FR-10, NFR-03, SAF-06), planned for sprint 7 of the sprint split (docs/sprint-split.md)

Its requirements belong to sprint 1; it is planned for sprint 4 because it builds on ITM-224, planned for sprint 4. Until then the prototype's code serves sprint 1.
