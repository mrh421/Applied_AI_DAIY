---
id: MOD-output-check
title: Accept or reject an AI draft
folder: prototype/src/output-check/
realises:
  - OUTPUT-FORMAT-CHECK
  - OUTPUT-COMPLETENESS-CHECK
  - OUTPUT-PROHIBITED-PATH-CHECK
  - NO-UNVALIDATED-OUTPUT
  - INSTRUCTION-STRUCTURE
  - NUMBERED-STEPS
  - PACKAGE-REASON
  - HANDOVER-BRIEF
  - NAME-DECIDING-INFORMATION
  - FOLLOW-UP-QUESTIONS
  - NO-BREAKER-ONLY-ISOLATION
  - PERMIT-FREE-NOT-RULE-FREE
  - SUSTAINABILITY-EXPLAINED
  - OUT-OF-SCOPE-NO-INSTRUCTIONS
follows:
  - ARC-002
uses:
  - MOD-case-model.schemas
  - MOD-case-model.AssessmentDraft
  - MOD-case-model.ExplanationDraft
  - MOD-case-model.ExplainRequest
  - MOD-case-model.StepAnswerDraft
  - MOD-illustrations.illustration
  - MOD-hazard-precheck.detectHazards
provides:
  - CheckFailure
  - CheckResult
  - checkAssessmentDraft
  - checkExplanationDraft
  - checkStepAnswerDraft
---
# MOD-output-check Accept or reject an AI draft

## Responsibility

It belongs to the Case domain (ARC-002). It decides whether an unvalidated AI output may go on. It checks the expected format, completeness and prohibited paths, and returns either the typed draft or the list of failures. Risk is not judged here; MOD-safety-enforcement converts high risk.

## Parts

- `index.ts`: the interface.
- `format.ts`: schema parse with the schemas of MOD-case-model.
- `completeness.ts`: the completeness rules listed under Interfaces.
- `prohibited.ts`: path rules and the prohibited-claim patterns in English and German.
- `check.ts`: the three public functions.
- `*.test.ts`: unit tests. One malformed, one incomplete and one prohibited draft per rule, each caught; one valid draft per kind, accepted; the prohibited-claim patterns in English and German, with near-miss negatives.

## Data

The prohibited-claim patterns are a closed table in `prohibited.ts`, each with an English and a German pattern; a new pattern is a new row, not a new function:

| Pattern | Requirement |
|---|---|
| the circuit breaker alone secures a circuit against being switched on again | NO-BREAKER-ONLY-ISOLATION |
| a permit-free project is free of other rules | PERMIT-FREE-NOT-RULE-FREE |
| a CO₂ figure in a sustainability statement, unless it carries a source | SUSTAINABILITY-EXPLAINED |
| a step, a warning or a safety measure may be skipped, left out or shortened, for example by experience ("experienced users can skip …") | SKILL-DOES-NOT-UNLOCK |
| there is no need to switch off, unplug or isolate | UNPLUG-BEFORE-OPENING, NO-BREAKER-ONLY-ISOLATION |
| opening a distribution board, a fuse box or a mains housing is described as a DIY action | NO-OPENING-MAINS-HOUSINGS |

`basics` have a maximum length of 600 characters, a chosen value that no requirement fixes.

## Interfaces

- `CheckFailure` — `{ check: 'format' | 'completeness' | 'prohibited-path'; path: string; message: string }`.
- `CheckResult<T>` — `{ ok: true; value: T } | { ok: false; failures: CheckFailure[] }`.
- `checkAssessmentDraft(raw: unknown, ctx: { round: 0 | 1 | 2 }): CheckResult<AssessmentDraft>` — its rules:
  - **Format:** the draft matches `schemas.assessmentDraft`.
  - **Completeness, for kind `questions`:** `missing` is non-empty and at least one question has text.
  - **Completeness, for kind `answer`:** `summary` is non-empty and at least one option exists; every package has a title, an area, a label, a reason and a handover brief; a package with `labelUncertain` has non-empty `decidingInformation`; every `diy` or `diy-preparation` package has a guide with a diagnosis, tools and materials lists, steps numbered 1..n without gaps, a time range and at least one warning.
  - **Prohibited paths:** questions at round 2; a guide in a package that the draft itself labels `professional-only` or `not-recommended`; an image id unknown to MOD-illustrations; any text that matches a prohibited-claim pattern.
- `checkExplanationDraft(raw: unknown, req: ExplainRequest): CheckResult<ExplanationDraft>` — exactly one non-empty `basics` per requested step, only for requested step numbers; no `basics` longer than 600 characters; no text that matches a prohibited-claim pattern, in particular none that skips, relaxes or replaces a step or a warning.
- `checkStepAnswerDraft(raw: unknown): CheckResult<StepAnswerDraft>` — the format matches; the answer is non-empty; no text matches a prohibited-claim pattern; `detectHazards` finds no hazard kind in the answer (a hit is a `prohibited-path` failure, and the pipeline then answers with the generic notice or, when the draft's `risk` is high, with the escalation).

**Errors a caller handles:** none thrown. Every failure is returned in `failures`.

## Files

It reads and writes no file.

## Uses

- `MOD-case-model.schemas` — the format check.
- `MOD-case-model.AssessmentDraft`, `MOD-case-model.ExplanationDraft`, `MOD-case-model.ExplainRequest` and `MOD-case-model.StepAnswerDraft` — the types it checks and returns.
- `MOD-illustrations.illustration` — to reject image ids that are not in the catalogue.
- `MOD-hazard-precheck.detectHazards` — the hazard check of a step answer.
