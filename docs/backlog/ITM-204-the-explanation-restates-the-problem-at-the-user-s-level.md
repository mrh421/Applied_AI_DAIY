---
id: ITM-204
title: The explanation restates the problem at the user's level
level: module
realises:
  - INPUT-USES-PROFILE
  - DETAIL-FOLLOWS-PROFILE
  - UC-001
modules:
  - MOD-ai-tasks
  - MOD-case-model
  - MOD-output-check
builds_on: []
tests:
  - unit
origin:
  - Sonnet review of the architecture draft, finding F-04 (2026-10-27), the optional part; ARC-011 keeps the assessment profile-blind, which the product owner accepted
---
# ITM-204 The explanation restates the problem at the user's level

**REGISTER**

## Outcome

`ExplanationDraft` gets `levelIntro`: two sentences that restate the problem for the user's skill level. The profile then shows in the interpretation the user reads, without reaching the assessment. The output check applies the prohibited-claim table to it and limits its length like `basics`. It is worth doing only if the reworded INPUT-USES-PROFILE still asks for the profile to show in the first answer.

## Acceptance

- A case with two different skill levels gets the same assessment and a different `levelIntro`.
- `levelIntro` never relaxes a step or a warning: a test with a skipping statement is rejected.
