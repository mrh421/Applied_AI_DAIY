---
id: ITM-261
title: The tests of the safety chain and the browser declare themselves
level: system
realises:
  - NO-GUIDE-FOR-HAZARDS
  - ESCALATION-REASON
  - HAZARD-SAFETY-MEASURES
  - UC-011
modules:
  - MOD-hazard-precheck
  - MOD-app-shell
builds_on:
  - ITM-256
tests:
  - unit
  - system
origin:
  - mrh (2026-11-02): set up Agent M's Tests section for the product; it counts only tests that declare themselves (MOD-test-document), so its pages showed no test at any level
---
# ITM-261 The tests of the safety chain and the browser declare themselves

**REGISTER**

## Outcome

The 18 tests of the hazard pre-check (`prototype/src/hazard-precheck/precheck.test.ts`) and the 8 system tests (`prototype/tests/system/`) carry a test declaration each, as MOD-test-document states it: the identifier, the level, the module, what the test guards, its precondition, its input and its expected result, in comment lines directly before the test case. Agent M's Tests pages count them, 18 at level unit and 8 at level system.

## Acceptance

- Agent M's `testDeclarations` reads 26 declarations from the product's test files, each with a title, and `testFindings` reports none.
- The tests run as before: the unit and component tests and the system tests pass.

## Priority

Should: makes the product's tests visible to the Tests pages of Agent M (Schedule, Browser, Runs, Audit); the other test files follow where time allows.
