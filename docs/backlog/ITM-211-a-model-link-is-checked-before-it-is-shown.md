---
id: ITM-211
title: A model link is checked before it is shown
level: module
realises:
  - 3D-MODEL-LINK
modules:
  - MOD-link-check
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-link-check.md
---
# ITM-211 A model link is checked before it is shown

**REGISTER**

## Outcome

`prototype/src/link-check/` offers `checkLink(url)`, which answers whether a 3D model link responds, with a short timeout and a cached answer, so that only working links are shown.

## Acceptance

- Unit tests against a local stub: a 200 answer is working, a 404 and a timeout are not, and a second call within the cache time makes no request.

## Priority

Could (from FR-06), planned for sprint 6 of docs/Implementation_Plan_EN.md
