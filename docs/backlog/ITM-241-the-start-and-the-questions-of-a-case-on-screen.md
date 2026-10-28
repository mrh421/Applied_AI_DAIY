---
id: ITM-241
title: The start and the questions of a case on screen
level: module
realises:
  - FREE-TEXT-INPUT
  - OPTIONAL-PHOTO
  - THREE-STEP-START
  - NO-PROMPT-SKILL-NEEDED
  - AI-INTERACTION-DISCLOSED
  - EVERYDAY-LANGUAGE-QUESTIONS
  - REDUNDANT-ENTRY
  - PRIVATE-BY-DEFAULT
  - UC-012
modules:
  - MOD-case-screens
builds_on:
  - ITM-234
  - ITM-210
  - ITM-212
  - ITM-239
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-screens.md
---
# ITM-241 The start and the questions of a case on screen

**REGISTER**

## Outcome

`CaseInputScreen` and `QuestionsScreen` replace `components/repair/Intake.tsx`: free text and an optional photo start a case in at most three required steps, with example prompts instead of prompt rules; the screen says before the first AI call that the answers come from an AI; questions show prefilled answers.

## Acceptance

- Component tests: a case starts with text alone in at most three steps; a photo is optional; the AI notice is visible before the first request; a prefilled answer is not asked again.
- Postcondition of UC-012: the user was informed that they interact with an AI system at the latest at the first interaction.

## Priority

Must (from FR-01, NFR-03), planned for sprint 4 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 1; it is planned for sprint 4 because it builds on ITM-234, planned for sprint 4. Until then the prototype's code serves sprint 1.
