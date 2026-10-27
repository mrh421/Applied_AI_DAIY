---
id: MOD-ai-tasks
title: Prompts and schemas of the AI tasks
folder: prototype/src/ai-tasks/
realises:
  - INPUT-USES-INVENTORY
  - INPUT-USES-PROFILE
  - DETAIL-FOLLOWS-PROFILE
  - SAFETY-CONTENT-PROFILE-INDEPENDENT
  - FOLLOW-UP-QUESTIONS
  - EVERYDAY-LANGUAGE-QUESTIONS
  - NO-ASSUMPTIONS-AS-FACTS
  - MODEL-BEFORE-PARTS
  - PLAIN-LANGUAGE
  - SHORT-SENTENCES
  - NUMBERED-STEPS
  - PROBLEM-SUMMARY
  - WORK-PACKAGES
  - HANDOVER-BRIEF
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
  - NO-PROMPT-SKILL-NEEDED
  - OPTIONAL-PHOTO
follows:
  - ARC-003
  - ARC-011
uses:
  - MOD-ai-gateway.generateJson
  - MOD-ai-gateway.AiContent
  - MOD-case-model.schemas
  - MOD-case-model.CaseRequest
  - MOD-case-model.ExplainRequest
  - MOD-case-model.StepQuestionRequest
  - MOD-illustrations.illustrationIndex
provides:
  - PROMPT_VERSION
  - draftAssessment
  - draftExplanation
  - draftStepAnswer
---
# MOD-ai-tasks Prompts and schemas of the AI tasks

## Responsibility

It belongs to AI access (ARC-003). It turns each kind of request into instructions and content for the model, and returns the model's unvalidated output.

## Parts

- `index.ts`: the interface.
- `assessment.ts`, `explanation.ts`, `step-answer.ts`: one task each, with its instructions and message building.
- `style.ts`: the shared writing rules: everyday language, short sentences, numbered steps; explain each technical term where it first appears; list assumptions as assumptions; the language of the user's input.
- `version.ts`: `PROMPT_VERSION`.
- `*.test.ts`: unit tests with MOD-ai-gateway replaced. The assessment message contains no profile field; the round-2 instructions forbid questions; the photo is passed as image content; the explanation request carries exactly the requested steps.

## Data

The instruction texts, versioned by `PROMPT_VERSION`.

## Interfaces

- `PROMPT_VERSION: string` — names the prompt set.
- `draftAssessment(req: CaseRequest): Promise<unknown>` — sends the description, the photo, the answers, the round and the inventory snapshot, with the illustration index, against `schemas.assessmentDraft`. It never receives the skill profile (ARC-011). The instructions require the AI to name what is missing; ask for the device model and variant before naming parts; ask no questions at round 2, and list assumptions instead; set the flags and kinds of the schema; split multi-task projects into packages; write a handover brief for every package; state the deciding information for uncertain labels.
- `draftExplanation(req: ExplainRequest): Promise<unknown>` — sends the steps and the level against `schemas.explanationDraft`, and asks for simpler wording when `simpler` is set.
- `draftStepAnswer(req: StepQuestionRequest): Promise<unknown>` — sends the package, the current step and the question against `schemas.stepAnswerDraft`.

**Errors a caller handles:** each function rejects with `AiError` of MOD-ai-gateway, unchanged.

## Files

It reads and writes no file.

## Uses

- `MOD-ai-gateway.generateJson` and `MOD-ai-gateway.AiContent` — the one call to the model, with text and image content.
- `MOD-case-model.schemas` — the output schema of each task.
- `MOD-case-model.CaseRequest`, `MOD-case-model.ExplainRequest` and `MOD-case-model.StepQuestionRequest` — the requests it turns into prompts.
- `MOD-illustrations.illustrationIndex` — the images the AI may reference.
