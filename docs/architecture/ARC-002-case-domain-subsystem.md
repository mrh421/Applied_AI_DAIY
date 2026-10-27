---
id: ARC-002
title: Subsystem Case domain
refines: ARC-001
forced_by:
  - RISK-CHECK-FIRST
  - PRECHECK-ENGLISH
  - PRECHECK-GERMAN
  - PRECHECK-COVERS-FOLLOW-UP-ANSWERS
  - PRECHECK-SPARES-PROJECT-PACKAGES
  - HAZARD-SAFETY-MEASURES
  - HAZARD-PROFESSIONAL
  - EMERGENCY-RISK-CRITICAL
  - EMERGENCY-ACTIONS-FIRST
  - OUT-OF-SCOPE-RISK-HIGH
  - OUT-OF-SCOPE-ESCALATION
  - OUT-OF-SCOPE-NO-INSTRUCTIONS
  - NO-GUIDE-FOR-HAZARDS
  - NO-GUIDE-AT-HIGH-RISK
  - UNCLEAR-CASES-CONSERVATIVE
  - ESCALATION-REASON
  - NO-ENERGY-RENOVATION-PLANNING
  - OUTPUT-FORMAT-CHECK
  - OUTPUT-COMPLETENESS-CHECK
  - OUTPUT-PROHIBITED-PATH-CHECK
  - NO-UNVALIDATED-OUTPUT
  - PACKAGE-LABEL
  - PACKAGE-REASON
  - STRICTER-LABEL-IF-UNCERTAIN
  - NAME-DECIDING-INFORMATION
  - NO-OPENING-MAINS-HOUSINGS
  - PERSON-FURNITURE-CONSERVATIVE
  - PERSON-FURNITURE-LOAD-QUESTION
  - PERSON-FURNITURE-DIMENSION-QUESTION
  - AGREE-WITH-PROFESSIONAL-BEFOREHAND
  - HANDOVER-BRIEF
  - MODEL-BEFORE-PARTS
  - WATER-SHUT-OFF-FIRST
  - UNPLUG-BEFORE-OPENING
  - NO-BREAKER-ONLY-ISOLATION
  - NO-PRINTED-SAFETY-PARTS
  - CHECK-LOCALLY
  - PERMIT-FREE-NOT-RULE-FREE
  - CHIMNEY-SWEEP-NOTICE-INSTALLATION
  - CHIMNEY-SWEEP-NOTICE-DECOMMISSIONING
  - FIRING-INSTALLATION-INSPECTION-NOTICE
  - PLANTING-BOUNDARY-DISTANCE
  - SHARED-BOUNDARY-CONSENT
  - TENANT-NOTICE
  - TENANT-MODIFICATION-RIGHT
  - WARRANTY-FUNDING-CHECK
  - ILLUSTRATIVE-IMAGES
  - TEXT-ALTERNATIVES
  - REPAIR-FIRST
  - REUSE-FIRST
  - UC-002
  - UC-003
  - UC-010
  - UC-011
  - UC-024
designs:
  - MOD-case-model
  - MOD-hazard-precheck
  - MOD-output-check
  - MOD-safety-enforcement
  - MOD-legal-notices
  - MOD-illustrations
---
# ARC-002 Subsystem Case domain

## Context

The safety requirements must hold whatever the AI writes. Each case is checked for hazards before the AI and checked again after it (RISK-CHECK-FIRST, NO-GUIDE-AT-HIGH-RISK). The format, completeness and prohibited paths of every AI output are checked (OUTPUT-FORMAT-CHECK, OUTPUT-COMPLETENESS-CHECK, OUTPUT-PROHIBITED-PATH-CHECK). Labels and safety steps follow fixed rules (NO-OPENING-MAINS-HOUSINGS, STRICTER-LABEL-IF-UNCERTAIN, WATER-SHUT-OFF-FIRST, UNPLUG-BEFORE-OPENING, NO-BREAKER-ONLY-ISOLATION). Legal duties are pointed out in fixed wording (UC-024). The server pipeline and the client screens share these rules and the vocabulary of a case: requests, drafts, outcomes, packages, labels and steps. ARC-001 places them in the lowest layer.

## Decision

**Responsibility:** the Case domain defines what a case consists of, and decides deterministically what of an AI draft may be shown and in which form. It performs no input or output, calls no AI and stores nothing.

**Interface it offers:**

- the types and zod schemas of a case (MOD-case-model), and `rankOptions` and `stricterLabel`;
- `precheck(texts)`, `detectHazards(text)` and `escalationFor(kinds, origin)` (MOD-hazard-precheck);
- `checkAssessmentDraft`, `checkExplanationDraft` and `checkStepAnswerDraft` (MOD-output-check);
- `enforceSafety` and `enforceStepAnswer` (MOD-safety-enforcement);
- `noticesFor` (MOD-legal-notices);
- `illustrationIndex` and `illustration` (MOD-illustrations).

**Modules:**

| Module | Responsibility |
|---|---|
| MOD-case-model | Types and schemas of every case datum that crosses a module boundary, and the ordering rules for options and labels |
| MOD-hazard-precheck | The hazard catalogue in English and German, hazard detection in text, and building escalations |
| MOD-output-check | Accepts or rejects an unvalidated AI draft: format, completeness, prohibited paths |
| MOD-safety-enforcement | Turns an accepted draft into the outcome that the safety rules allow |
| MOD-legal-notices | The catalogue of legal notices with their fixed texts and marks |
| MOD-illustrations | The catalogue of available illustrative images with their text alternatives |

**Internal relations:**

- MOD-hazard-precheck, MOD-output-check, MOD-legal-notices and MOD-safety-enforcement use MOD-case-model.
- MOD-safety-enforcement uses MOD-hazard-precheck to build escalations.
- MOD-output-check uses MOD-illustrations to reject unknown image ids.

All modules are pure TypeScript and are imported by both the server and the client.

**Order of the rules:** the check rejects, and enforcement converts. A draft that the check rejects is never shown. A notice replaces it. A draft that passes the check is shaped by enforcement:

- escalation for high or critical risk, out-of-scope work, or unclear risk at the last round;
- fixed follow-up questions;
- stricter labels;
- removal of guides from packages whose label forbids DIY work;
- inserted safety steps.

The SPEC's check of NO-GUIDE-AT-HIGH-RISK feeds the enforcement exactly so.

**Principles:** one responsibility per module; DRY, each catalogue is defined once; design to test, pure functions; layers, the lowest layer with no dependencies upwards.

## Alternatives

- **Rules inside the prompt only.** Rejected: instruction-based safety is not enforcement (ch. 10, OpenClaw). NO-GUIDE-AT-HIGH-RISK and RISK-CHECK-FIRST demand code.
- **One combined validator module.** Rejected: rejection, which yields a notice, and conversion, which yields an escalation, stricter labels or inserted steps, have different results and different tests. One module would hold two concerns.
- **Keyword lists in the database or a remote rules service.** Rejected: there is no need to change rules at runtime (YAGNI). Catalogues in code are versioned with their tests.
- **The AI decides labels itself, with no enforcement.** Rejected: SKILL-DOES-NOT-UNLOCK, NO-OPENING-MAINS-HOUSINGS and STRICTER-LABEL-IF-UNCERTAIN would depend on the model.

## Consequences

- Every safety rule is in one place and is tested without a network.
- New hazard kinds or notice kinds are added to a catalogue without changing a function (open for extension).
- The AI must report structured flags (risk, hazard kinds, out-of-scope area, package flags, step flags, notice kinds). Enforcement relies on them, and the output check rejects a draft without them.
- Some judgement stays with the AI, such as whether a step opens a device. A wrong flag is a model error that the evaluation cases must find.
