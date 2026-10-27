---
id: MOD-safety-enforcement
title: Shape a checked draft by the safety rules
folder: prototype/src/safety-enforcement/
realises:
  - NO-GUIDE-AT-HIGH-RISK
  - OUT-OF-SCOPE-ESCALATION
  - OUT-OF-SCOPE-NO-INSTRUCTIONS
  - UNCLEAR-CASES-CONSERVATIVE
  - MODEL-BEFORE-PARTS
  - PERSON-FURNITURE-CONSERVATIVE
  - PERSON-FURNITURE-LOAD-QUESTION
  - PERSON-FURNITURE-DIMENSION-QUESTION
  - NO-OPENING-MAINS-HOUSINGS
  - STRICTER-LABEL-IF-UNCERTAIN
  - NAME-DECIDING-INFORMATION
  - SKILL-DOES-NOT-UNLOCK
  - AGREE-WITH-PROFESSIONAL-BEFOREHAND
  - WATER-SHUT-OFF-FIRST
  - UNPLUG-BEFORE-OPENING
  - NO-BREAKER-ONLY-ISOLATION
  - NO-PRINTED-SAFETY-PARTS
  - FOLLOW-UP-QUESTIONS
  - STEP-QUESTION-HAZARD-CHECK
  - NO-ASSUMPTIONS-AS-FACTS
follows:
  - ARC-002
  - ARC-011
uses:
  - MOD-case-model.AssessmentDraft
  - MOD-case-model.Answer
  - MOD-case-model.CaseOutcome
  - MOD-case-model.StepAnswerDraft
  - MOD-case-model.StepAnswerOutcome
  - MOD-case-model.stricterLabel
  - MOD-case-model.FIXED_TOPICS
  - MOD-hazard-precheck.escalationFor
provides:
  - EnforceContext
  - enforceSafety
  - enforceStepAnswer
---
# MOD-safety-enforcement Shape a checked draft by the safety rules

## Responsibility

It belongs to the Case domain (ARC-002). It turns an accepted AI draft into the outcome that the safety rules allow: escalation, follow-up questions or guidance with enforced labels and fixed safety steps. No rule reads a skill level; the module has none to read (ARC-011).

## Parts

- `index.ts`: the interface.
- `enforce.ts`: the rules, applied in order.
- `fixed.ts`: the fixed texts: the questions for model, variant, load and dimensions; the shut-off-water step; the unplug step; the lock-out warning against switching on again; the advice to agree preparation with the professional beforehand; the note on unknown models.
- `*.test.ts`: unit tests per rule, including the order of rules. The subsystem test `src/test/safety.test.ts` covers the SPEC's check: a guide with high risk becomes an escalation without a guide.

## Data

The fixed texts only.

## Interfaces

- `EnforceContext` — `{ round: 0 | 1 | 2; answers: Answer[] }`.
- `enforceSafety(draft: AssessmentDraft, ctx: EnforceContext): CaseOutcome` — never of type `notice`; guidance is returned with notices empty and options unranked. Its rules, in order; the first rule that yields an escalation ends the run, and questions are collected across rules:
  1. **Escalation.** `outOfScope` is set, or `risk` is `high` or `critical`: return `escalationFor(hazards plus outOfScope, 'output')`. The result has no guide (NO-GUIDE-AT-HIGH-RISK).
  2. **Unclear risk.** `riskUncertain` is set. Before round 2, return the draft's questions, or an escalation if it has none. At round 2, return an escalation (UNCLEAR-CASES-CONSERVATIVE).
  3. **Device model.** The case concerns a device and the model is unknown. Before round 2, put the model and variant questions first and name no part. At round 2, remove the replacement-part materials and add the unknown-model assumption (MODEL-BEFORE-PARTS).
  4. **Person-carrying furniture.** A package carries a person, and load or dimensions are not among the answers. Before round 2, add the load and dimension questions. At round 2, set the label to `not-recommended` with load and dimensions as deciding information.
  5. **Questions.** If the draft kind is `questions`, or rules 3 or 4 added questions, and the round is below 2, return the questions with round = ctx.round + 1.
  6. **Mains housing.** A package with `opensMainsHousing` gets the label `professional-only` (NO-OPENING-MAINS-HOUSINGS).
  7. **Uncertain label.** A package with `labelUncertain` gets `stricterLabel(label, alternativeLabel or the next stricter label)` (STRICTER-LABEL-IF-UNCERTAIN).
  8. **Guide removal.** A package labelled `professional-only` or `not-recommended` loses its guide.
  9. **Preparation.** A `diy-preparation` package gets the agree-beforehand text.
  10. **Fixed safety steps**, in each remaining guide: water-related work starts with the shut-off step; the unplug step comes before the first step that opens a device; a guide with a step that switches off a circuit gets the lock-out warning; the steps are renumbered.
  11. **Unclear safety-critical status.** A material with `safetyCritical` `unclear` becomes `yes`.
  12. **Result.** Return guidance with the draft's summary, assumptions and `photoDescription` as `photoAlt`.
- `enforceStepAnswer(draft: StepAnswerDraft): StepAnswerOutcome` — `risk` `high` or `critical` gives `escalationFor(hazards, 'output')`; otherwise the answer is returned.

**Errors a caller handles:** none. The functions are total over valid drafts.

## Files

It reads and writes no file.

## Uses

- `MOD-case-model.AssessmentDraft`, `MOD-case-model.Answer`, `MOD-case-model.CaseOutcome`, `MOD-case-model.StepAnswerDraft` and `MOD-case-model.StepAnswerOutcome` — what it receives and returns.
- `MOD-case-model.stricterLabel` — rule 7.
- `MOD-case-model.FIXED_TOPICS` — the topics of the fixed questions and of the answers it looks for.
- `MOD-hazard-precheck.escalationFor` — the escalations of rules 1 and 2 and of `enforceStepAnswer`.
