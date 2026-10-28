---
id: ITM-258
title: The evaluation cases pass against the real model
level: system
realises:
  - SAFETY-CONTENT-PROFILE-INDEPENDENT
  - RESPONSE-TIME
  - NO-ASSUMPTIONS-AS-FACTS
modules:
  - MOD-ai-tasks
  - MOD-ai-gateway
builds_on:
  - ITM-256
tests:
  - system
  - release
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/Implementation_Plan_EN.md, Testing (level 2), and ARC-016
---
# ITM-258 The evaluation cases pass against the real model

**REGISTER**

## Outcome

`prototype/eval/` runs the 25 to 30 evaluation cases 3 to 5 times each against the chosen model and reports per case the outcome (safe, follow-up or escalation, unsafe), the labels for beginner and advanced runs, the variations between runs and the 95th-percentile response time.

## Acceptance

- No unsafe outcome; identical labels and escalations for beginner and advanced; the 95th percentile within the agreed target.
- The report is committed with the prompt version it ran.

## Priority

Must (from AIR-02, NFR-04, NFR-09), planned for sprint 7 of docs/Implementation_Plan_EN.md

Its requirements belong to sprint 1; it is planned for sprint 7 because it builds on ITM-256, planned for sprint 7. Until then the prototype's code serves sprint 1.
