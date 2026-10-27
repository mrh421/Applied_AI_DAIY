---
id: ITM-205
title: The prototype loses its Lovable leftovers
level: module
realises:
  - DATA-MINIMISATION
modules:
  - MOD-app-shell
  - MOD-ai-gateway
builds_on: []
tests:
  - unit
origin:
  - Product owner decision of 2026-10-27 on ARC-009 and the Sonnet review (F-11): the prototype was generated with Lovable and is developed only in this repository from now on
---
# ITM-205 The prototype loses its Lovable leftovers

**REGISTER**

## Outcome

`src/lib/error-capture.ts` and `src/lib/lovable-error-reporting.ts` are deleted, and `src/server.ts` (`consumeLastCapturedError`) and `src/routes/__root.tsx` (`reportLovableError`) lose the calls; the error page stays. `vite.config.ts` drops `@lovable.dev/vite-tanstack-config` and sets the nitro preset `node-server`. The AI call no longer uses `LOVABLE_API_KEY` (ARC-010).

## Acceptance

- No file or dependency of the repository names Lovable, apart from the README's note on where the prototype came from.
- The build starts with the Node preset, and an error in a route still shows the error page.
