---
id: ITM-223
title: The skill profile is kept on the device with beginner as default
level: module
realises:
  - SKILL-PROFILE
  - DEFAULT-BEGINNER
  - PROFILE-ON-DEVICE
  - SETUP-NEVER-BLOCKS
  - DATA-RECTIFICATION
  - UC-013
modules:
  - MOD-profile
builds_on:
  - ITM-207
  - ITM-218
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-profile.md and ARC-011
---
# ITM-223 The skill profile is kept on the device with beginner as default

**REGISTER**

## Outcome

`lib/profiles.ts` becomes `prototype/src/profile/`: one level per skill area, stored through MOD-local-store; `levelFor(area)` answers beginner where no level is set; a level can be changed or cleared. Nothing of it goes to a server without an account.

## Acceptance

- Unit tests: an empty profile gives beginner for every area; a set level survives a reload; a cleared level is gone.
- Postcondition of UC-013: every level the user set is stored on the device and shown, and no profile was sent to a server without an account.

## Priority

Must (from FR-10, NFR-03), planned for sprint 5 of the sprint split (docs/sprint-split.md)
