---
id: ITM-255
title: The User interface subsystem works as one
level: subsystem
realises:
  - UC-012
  - UC-025
  - UC-026
  - UC-027
modules:
  - MOD-ui-kit
  - MOD-app-shell
  - MOD-case-screens
  - MOD-materials-screens
  - MOD-data-screens
integrates: ARC-008
builds_on:
  - ITM-213
  - ITM-248
  - ITM-243
  - ITM-244
  - ITM-246
  - ITM-247
  - ITM-202
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-008-user-interface-subsystem.md
---
# ITM-255 The User interface subsystem works as one

**REGISTER**

## Outcome

Every screen is reached from the shell, built from the kit, and passes the accessibility rules in jsdom.

## Acceptance

- Component test `prototype/src/test/user-interface.test.tsx`: every route renders with labels on every control and no axe violation in jsdom; a status message is announced without moving focus.
- Postcondition of UC-027: every control has a descriptive label and every status message is announced.

## Priority

Should (from NFR-07), planned for sprint 9 or later, after the cut decision (docs/sprint-split.md)
