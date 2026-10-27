---
id: ARC-003
title: Subsystem AI access
refines: ARC-001
forced_by:
  - NO-UNVALIDATED-OUTPUT
  - NO-ASSUMPTIONS-AS-FACTS
  - EVERYDAY-LANGUAGE-QUESTIONS
  - PLAIN-LANGUAGE
  - SHORT-SENTENCES
  - NUMBERED-STEPS
  - NO-PROMPT-SKILL-NEEDED
  - PROBLEM-SUMMARY
  - INPUT-USES-INVENTORY
  - INPUT-USES-PROFILE
  - DETAIL-FOLLOWS-PROFILE
  - SAFETY-CONTENT-PROFILE-INDEPENDENT
  - FOLLOW-UP-QUESTIONS
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
  - RESPONSE-TIME
  - OPTIONAL-PHOTO
  - UC-001
  - UC-002
  - UC-003
  - UC-004
  - UC-010
  - UC-024
designs:
  - MOD-ai-tasks
  - MOD-ai-gateway
---
# ARC-003 Subsystem AI access

## Context

Three functions of the product need a language model:

- interpreting a case and drafting an answer with questions, packages and guides (UC-001, UC-002, UC-003, UC-010, UC-024);
- explaining steps at a skill level and explaining a step again more simply (DETAIL-FOLLOWS-PROFILE, STEP-RE-EXPLAIN);
- answering a question during the work (FOLLOW-UP-DURING-EXECUTION).

The API key must stay on the server (ch. 10). Prompts must be traceable to versions. What the model returns is untrusted until the Case domain has checked it (NO-UNVALIDATED-OUTPUT).

## Decision

**Responsibility:** AI access is the only path from DAIY to the AI model. It turns a case request into a prompt with a JSON schema, calls the provider and returns the draft unvalidated, typed `unknown`.

**Interface it offers:** `draftAssessment(req: CaseRequest)`, `draftExplanation(req: ExplainRequest)` and `draftStepAnswer(req: StepQuestionRequest)`. Each returns `Promise<unknown>` and rejects with `AiError`, the error type of MOD-ai-gateway. The `unknown` result type forces every caller through MOD-output-check before it can use the draft. `PROMPT_VERSION` names the prompt set.

**Modules:**

| Module | Responsibility |
|---|---|
| MOD-ai-tasks | The three tasks: their instructions, their message building and their output schemas, taken from MOD-case-model |
| MOD-ai-gateway | The provider call: credentials, model choice, timeout, schema-constrained generation, mapping provider errors to `AiError` |

MOD-ai-tasks uses MOD-ai-gateway, MOD-case-model and MOD-illustrations. MOD-ai-gateway uses no module. It is the only file that imports the provider SDK (ARC-010).

The assessment task never receives the skill profile. Only the explanation task receives the skill level of one area (ARC-011).

**Principles:** probabilistic reasoning above a deterministic boundary (ch. 11); develop against interfaces; an interface hides its implementation; a remote interface names how it fails.

## Alternatives

- **Calling the provider inside the pipeline module.** Rejected: provider details and prompts would mix with the order of filters. The provider could not be swapped or replaced in tests at one place.
- **One generic `ask(prompt)` function.** Rejected: the caller would write prompts. Prompts would spread over modules and could no longer be versioned in one place.
- **Tool calling or an agent loop.** Rejected: no task needs the model to act. A single structured call is simpler and faster (KISS, RESPONSE-TIME).

## Consequences

- Changing the provider or the model touches only MOD-ai-gateway.
- Prompt changes are visible as changes of MOD-ai-tasks with a new `PROMPT_VERSION`.
- Tests replace MOD-ai-gateway, or point it at a local stub, and need no network.
