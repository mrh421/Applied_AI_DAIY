---
id: ITM-221
title: The AI drafts the assessment and the explanation
level: module
realises:
  - INPUT-USES-INVENTORY
  - FOLLOW-UP-QUESTIONS
  - EVERYDAY-LANGUAGE-QUESTIONS
  - NO-ASSUMPTIONS-AS-FACTS
  - PLAIN-LANGUAGE
  - SHORT-SENTENCES
  - NUMBERED-STEPS
  - PROBLEM-SUMMARY
  - WORK-PACKAGES
  - NO-PROMPT-SKILL-NEEDED
  - OPTIONAL-PHOTO
  - SAFETY-CONTENT-PROFILE-INDEPENDENT
  - DETAIL-FOLLOWS-PROFILE
modules:
  - MOD-ai-tasks
builds_on:
  - ITM-208
  - ITM-207
  - ITM-209
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-ai-tasks.md and ARC-011
---
# ITM-221 The AI drafts the assessment and the explanation

**REGISTER**

## Outcome

The prompts and calls of `lib/repair.functions.ts` move into `prototype/src/ai-tasks/` with a `PROMPT_VERSION`. `draftAssessment` sends the description, the answers, the inventory snapshot and the photo, but no profile field (ARC-011), and asks in everyday language for what is missing, at most two rounds; the second round forbids questions and lists assumptions. `draftExplanation` writes the summary and the numbered steps in short plain sentences at the user's level, without touching steps or warnings.

## Acceptance

- Unit tests with the gateway replaced: the assessment message contains no profile field; the round-2 instructions forbid questions; the photo is passed as image content; the explanation request carries the level and the output schema.
- The prompts are versioned in the repository (NFR-08).

## Priority

Must (from AIR-01, AIR-02, FR-01, FR-02, FR-03, FR-14, NFR-02, NFR-09), planned for sprint 1 of docs/Implementation_Plan_EN.md
