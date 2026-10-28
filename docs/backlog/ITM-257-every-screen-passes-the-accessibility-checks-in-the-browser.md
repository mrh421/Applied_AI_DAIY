---
id: ITM-257
title: Every screen passes the accessibility checks in the browser
level: system
realises:
  - ADEQUATE-CONTRAST
  - REFLOW
  - KEYBOARD-OPERABLE
  - FOCUS-VISIBLE
  - TARGET-SIZE
  - UC-025
  - UC-026
  - UC-027
modules:
  - MOD-app-shell
  - MOD-ui-kit
builds_on:
  - ITM-256
tests:
  - system
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-016 (WCAG 2.2 A and AA)
---
# ITM-257 Every screen passes the accessibility checks in the browser

**REGISTER**

## Outcome

The system tests run `@axe-core/playwright` on every screen, at 320 CSS pixels, at 200 percent text and with the keyboard only.

## Acceptance

- System tests: no axe violation; no horizontal scrolling at 320 CSS pixels; a full case completes by keyboard alone with visible focus.
- Postconditions of UC-025 and UC-026.

## Priority

Should (from NFR-07), planned for sprint 7 of docs/Implementation_Plan_EN.md
