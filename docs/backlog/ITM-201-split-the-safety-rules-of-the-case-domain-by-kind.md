---
id: ITM-201
title: Split the safety rules into question rules and label rules
level: module
realises:
  - UNCLEAR-CASES-CONSERVATIVE
  - PERSON-FURNITURE-CONSERVATIVE
  - MODEL-BEFORE-PARTS
  - STRICTER-LABEL-IF-UNCERTAIN
modules:
  - MOD-safety-enforcement
builds_on: []
tests:
  - unit
origin:
  - Sonnet review of the architecture draft, finding m-06 (2026-10-27): MOD-safety-enforcement holds 12 rules for 20 requirements
---
# ITM-201 Split the safety rules into question rules and label rules

**REGISTER**

## Outcome

MOD-safety-enforcement keeps the escalation, label, mains-housing and result rules (1, 1b, 2, 6 to 9 and 11). The question and step rules (3, 4, 5 and 10) move to a module `MOD-guide-rules` of its own, which the architecture names when this item is taken: the module file, the `follows` and `uses` of both, and the diagram of ARC-001. The order of the rules and the tests per rule do not change.

## Acceptance

- The module files of both modules and ARC-001 are changed together, and the schema and coverage checks pass.
- `src/test/safety.test.ts` and the unit tests per rule pass unchanged; the order of the rules is a test.
