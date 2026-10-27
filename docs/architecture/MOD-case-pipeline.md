---
id: MOD-case-pipeline
title: The filters of every AI request
folder: prototype/src/case-pipeline/
realises:
  - RISK-CHECK-FIRST
  - PRECHECK-COVERS-FOLLOW-UP-ANSWERS
  - STEP-QUESTION-HAZARD-CHECK
  - NO-UNVALIDATED-OUTPUT
  - OUTPUT-FORMAT-CHECK
  - OUTPUT-COMPLETENESS-CHECK
  - OUTPUT-PROHIBITED-PATH-CHECK
  - NO-GUIDE-AT-HIGH-RISK
  - UNDERSTANDABLE-ERROR-NOTICE
  - REPAIR-FIRST
  - REUSE-FIRST
  - PROFILE-ON-DEVICE
  - UC-024
follows:
  - ARC-004
  - ARC-001
uses:
  - MOD-hazard-precheck.precheck
  - MOD-ai-tasks.draftAssessment
  - MOD-ai-tasks.draftExplanation
  - MOD-ai-tasks.draftStepAnswer
  - MOD-ai-tasks.PROMPT_VERSION
  - MOD-ai-gateway.AiError
  - MOD-output-check.checkAssessmentDraft
  - MOD-output-check.checkExplanationDraft
  - MOD-output-check.checkStepAnswerDraft
  - MOD-safety-enforcement.enforceSafety
  - MOD-safety-enforcement.enforceStepAnswer
  - MOD-legal-notices.noticesFor
  - MOD-case-model.schemas
  - MOD-case-model.rankOptions
  - MOD-case-model.CaseRequest
  - MOD-case-model.CaseOutcome
  - MOD-case-model.ExplainRequest
  - MOD-case-model.ExplainOutcome
  - MOD-case-model.StepQuestionRequest
  - MOD-case-model.StepAnswerOutcome
  - MOD-case-model.UserNotice
provides:
  - assessCase
  - explainSteps
  - answerStepQuestion
---
# MOD-case-pipeline The filters of every AI request

## Responsibility

It belongs to Case guidance (ARC-004). It runs the filters of each AI request on the server in their fixed order (ARC-001, pipe-and-filter), and turns every failure into a notice outcome.

## Parts

- `index.ts`: the interface.
- `assess.ts`, `explain.ts`, `step-question.ts`: one server function each.
- `notices.ts`: the plain-language texts of the `UserNotice`s.
- `*.test.ts`: unit tests with MOD-ai-tasks replaced by a counting double. A hazard in the description, in a follow-up answer and in a step question leads to an escalation with zero AI calls; a malformed, an incomplete and a prohibited draft each give a notice; a high-risk draft gives an escalation; an `AiError` gives a notice; guidance is ranked and carries notices.

## Data

None stored. The server keeps no case state.

## Interfaces

These are server functions made with `createServerFn`. They are remote calls from the browser over HTTPS POST with JSON. Each call logs `PROMPT_VERSION`, the model, the outcome type and the failure checks, but no case text.

- `assessCase: (req: CaseRequest) => Promise<CaseOutcome>` — the pipe:
  1. Parse the input with `schemas.caseRequest`. Invalid input gives notice `technical-error`.
  2. `precheck([description, ...answers.map(a => a.text)])`. An escalation is returned, and no AI call is made.
  3. `draftAssessment`.
  4. `checkAssessmentDraft`. A failure gives notice `output-rejected`, except when the format check passed and `risk` is `high` or `critical`: the completeness check is then skipped and the draft goes to enforcement, so the user gets the escalation and its hazard information and not only a notice to retry.
  5. `enforceSafety`.
  6. For guidance only: `rankOptions`, and `noticesFor(draft.notices)`.
  An `AiError` gives notice `technical-error` with a text per code, and nothing is invented.
- `explainSteps: (req: ExplainRequest) => Promise<ExplainOutcome>` — parse; `draftExplanation`; `checkExplanationDraft`, then return.
- `answerStepQuestion: (req: StepQuestionRequest) => Promise<StepAnswerOutcome>` — parse; `precheck([question])`, where an escalation is returned without an AI call; `draftStepAnswer`; `checkStepAnswerDraft`, which also runs the hazard check of the answer text; `enforceStepAnswer`. As for the assessment, a failed check of a draft whose `risk` is `high` or `critical` goes to `enforceStepAnswer`.

**Errors a caller handles:** on the server the functions resolve with a notice for every failure and do not throw. On the client, a network failure rejects the call's promise with a `TypeError`.

## Files

It reads and writes no file.

## Uses

- `MOD-hazard-precheck.precheck` — the first filter.
- `MOD-ai-tasks.draftAssessment`, `MOD-ai-tasks.draftExplanation`, `MOD-ai-tasks.draftStepAnswer` and `MOD-ai-tasks.PROMPT_VERSION` — the AI filter and the logged prompt version.
- `MOD-ai-gateway.AiError` — the error type of a failed AI call, mapped to a notice.
- `MOD-output-check.checkAssessmentDraft`, `MOD-output-check.checkExplanationDraft` and `MOD-output-check.checkStepAnswerDraft` — the output checks.
- `MOD-safety-enforcement.enforceSafety` and `MOD-safety-enforcement.enforceStepAnswer` — the enforcement.
- `MOD-legal-notices.noticesFor` — the notices of guidance.
- `MOD-case-model.schemas` and `MOD-case-model.rankOptions` — parsing the input and ranking the options.
- `MOD-case-model.CaseRequest`, `MOD-case-model.CaseOutcome`, `MOD-case-model.ExplainRequest`, `MOD-case-model.ExplainOutcome`, `MOD-case-model.StepQuestionRequest`, `MOD-case-model.StepAnswerOutcome` and `MOD-case-model.UserNotice` — the types of its interface.
