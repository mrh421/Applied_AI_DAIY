---
id: MOD-hazard-precheck
title: Hazard catalogue and pre-check
folder: prototype/src/hazard-precheck/
realises:
  - RISK-CHECK-FIRST
  - PRECHECK-ENGLISH
  - PRECHECK-GERMAN
  - PRECHECK-COVERS-FOLLOW-UP-ANSWERS
  - PRECHECK-SPARES-PROJECT-PACKAGES
  - STEP-QUESTION-HAZARD-CHECK
  - HAZARD-SAFETY-MEASURES
  - HAZARD-PROFESSIONAL
  - EMERGENCY-RISK-CRITICAL
  - OUT-OF-SCOPE-RISK-HIGH
  - EMERGENCY-ACTIONS-FIRST
  - OUT-OF-SCOPE-ESCALATION
  - OUT-OF-SCOPE-NO-INSTRUCTIONS
  - NO-GUIDE-FOR-HAZARDS
  - ESCALATION-REASON
  - NO-ENERGY-RENOVATION-PLANNING
  - NO-BREAKER-ONLY-ISOLATION
follows:
  - ARC-002
uses:
  - MOD-case-model.HazardKind
  - MOD-case-model.Escalation
provides:
  - detectHazards
  - precheck
  - escalationFor
---
# MOD-hazard-precheck Hazard catalogue and pre-check

## Responsibility

It belongs to the Case domain (ARC-002). It recognises hazard and out-of-scope signals in text written in English and German, and builds the escalation that fits the detected kinds.

## Parts

- `index.ts`: the interface.
- `catalogue.ts`: one entry per `HazardKind`. Each entry holds:
  - whether the kind is an emergency;
  - its English and German patterns;
  - its immediate actions;
  - the kind of professional to contact;
  - the reason why no instructions are given.
- `precheck.ts`: the detection and the escalation builder.
- `*.test.ts`: unit tests, one per kind: an English and a German positive, a near-miss negative, and the inputs of the classification cases, which are not blocked. The subsystem test `src/test/safety.test.ts` covers the checks the SPEC names: the actions and the professional of each kind; `high` for out-of-scope work and `critical` for an emergency; emergency actions first for a mixed input.

## Data

The catalogue lists two groups of kinds:

- **Emergencies:** gas, carbon monoxide, fire or smoke, overheating or scorched electrics, water near electrics, structural damage.
- **Out of scope:** distribution board, fixed 230/400 V installation, grid connection, gas installation, refrigerant circuit, load-bearing structure, chimney, energy renovation.

The patterns do not match installation work that can be one package of a larger project: a new socket, a ceiling light or a wallbox (PRECHECK-SPARES-PROJECT-PACKAGES). Each kind's actions belong only to that kind (HAZARD-SAFETY-MEASURES). For example, a carbon monoxide alarm gets ventilation, leaving the room and calling the emergency number, and never advice on the fuse box. No action presents a fuse-box switch-off as securing a circuit (NO-BREAKER-ONLY-ISOLATION).

## Interfaces

- `detectHazards(text: string): HazardKind[]` — the detected kinds in catalogue order, without duplicates.
- `precheck(texts: string[]): Escalation | null` — joins all texts, which are the description and every follow-up answer or the step question, and returns `null` when no kind is detected. Otherwise it returns `escalationFor(kinds, 'precheck')`.
- `escalationFor(kinds: HazardKind[], origin: 'precheck' | 'output'): Escalation` — builds the escalation:
  - `risk` is `critical` if any kind is an emergency, and `high` otherwise;
  - `actions` and `professionals` list the emergency kinds before the others, without duplicates;
  - `reason` is a plain-language sentence that names the kinds and says why no instructions are given;
  - an empty `kinds` list gives the generic escalation: stop the work, and contact a qualified professional of the trade concerned.

**Errors a caller handles:** none. The functions are total.

## Files

It reads and writes no file.

## Uses

- `MOD-case-model.HazardKind` and `MOD-case-model.Escalation` — the kinds it detects and the escalation it builds.
