---
id: ITM-248
title: The app shell routes to the module screens
level: module
realises:
  - GO-BACK
  - KEYBOARD-OPERABLE
  - USE-WITHOUT-ACCOUNT
  - UC-017
modules:
  - MOD-app-shell
builds_on:
  - ITM-244
  - ITM-245
  - ITM-238
  - ITM-240
  - ITM-233
tests:
  - unit
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-app-shell.md and ARC-009
---
# ITM-248 The app shell routes to the module screens

**REGISTER**

## Outcome

`routes/`, `router.tsx`, `server.ts`, `start.ts`, `styles.css` and the error page move into `prototype/src/app-shell/` with `routesDirectory` set there; `src/lib`, `src/components` and `src/hooks` are gone; an ESLint `no-restricted-imports` rule forbids imports into another module's folder other than its `index.ts`. Every route has a back control and works without an account.

## Acceptance

- `test/app-routing.test.tsx` moves into the module and passes; lint fails on an import into another module's folder.
- Postcondition of UC-017: a full case runs without an account.

## Priority

Should (from FR-08), planned for sprint 5 of docs/Implementation_Plan_EN.md
