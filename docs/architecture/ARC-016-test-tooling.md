---
id: ARC-016
title: Test tooling and placement
refines: ARC-001
forced_by:
  - HAZARD-SAFETY-MEASURES
  - NO-GUIDE-AT-HIGH-RISK
  - PRECHECK-ENGLISH
  - PRECHECK-GERMAN
  - PRECHECK-SPARES-PROJECT-PACKAGES
  - OUT-OF-SCOPE-RISK-HIGH
  - EMERGENCY-RISK-CRITICAL
  - EMERGENCY-ACTIONS-FIRST
  - RESPONSE-TIME
  - SKILL-DOES-NOT-UNLOCK
  - PACKAGE-LABEL
  - KEYBOARD-OPERABLE
  - REFLOW
  - READABLE-TEXT
  - ADEQUATE-CONTRAST
  - UC-003
  - UC-010
  - UC-011
  - UC-025
  - UC-026
  - UC-027
---
# ARC-016 Test tooling and placement

## Context

ARC-001 states testing at three levels. The checks of HAZARD-SAFETY-MEASURES, NO-GUIDE-AT-HIGH-RISK, PRECHECK-ENGLISH, PRECHECK-GERMAN, PRECHECK-SPARES-PROJECT-PACKAGES, OUT-OF-SCOPE-RISK-HIGH, EMERGENCY-RISK-CRITICAL and EMERGENCY-ACTIONS-FIRST name `src/test/safety.test.ts`. Most other checks are left to review, which needs repeatable evaluation runs with the real model, for example for RESPONSE-TIME, SKILL-DOES-NOT-UNLOCK and PACKAGE-LABEL. System tests must not depend on the real AI provider. The accessibility requirements, such as KEYBOARD-OPERABLE, REFLOW, READABLE-TEXT and ADEQUATE-CONTRAST, need automated checks wherever possible.

## Decision

- **Unit and subsystem tests:**
  - Vitest with jsdom and @testing-library/react (npm), already in the prototype;
  - `fake-indexeddb` (npm) for MOD-local-store and MOD-history;
  - temporary SQLite files for the server modules;
  - unit tests sit beside their module as `*.test.ts`, and subsystem tests in `prototype/src/test/<subsystem>.test.ts`;
  - the Case domain's subsystem test is `prototype/src/test/safety.test.ts`.
- **AI replacement:**
  - in unit tests of MOD-case-pipeline, MOD-ai-tasks is replaced with `vi.mock`, which also counts AI calls;
  - in system tests, MOD-ai-gateway is pointed with `AI_BASE_URL` at a stub HTTP server in `prototype/tests/system/ai-stub/` that returns recorded drafts.
- **System tests:**
  - Playwright (`@playwright/test`, npm) in `prototype/tests/system/`, against the production build;
  - axe checks through `@axe-core/playwright` on every screen;
  - runs at 320 CSS pixels, at 200 percent text and with the keyboard only.
- **Evaluation:** `prototype/eval/` holds the evaluation cases and a runner against the real model. It reports the outcome per case, labels for beginner and advanced runs, and the 95th-percentile response time, for the reviews the SPEC calls for.
- **CI:** lint, type check, unit, subsystem and system tests run on every pull request. Evaluation runs on demand, because it costs model calls.

**Principles:** design to test; DRY, one stub serves all system tests.

## Alternatives

| Alternative | Ecosystem | Why not |
|---|---|---|
| Jest | npm | Equivalent. Vitest is already configured and fits Vite. |
| Cypress | npm | Equivalent to Playwright. Playwright drives several browsers and has the axe integration used here. |
| MSW to mock the AI | npm | Intercepts in-process fetches. The stub server serves the built server process too. |
| Calling the real model in CI | — | Not repeatable, and it costs per run. |

## Consequences

- Automated tests can prove the deterministic rules of the SPEC, such as no AI call on a hazard. The quality of the model's judgement is shown by evaluation and review.
- Recorded drafts in the stub must be updated when the output schema changes. A schema test catches recordings that have become outdated.
