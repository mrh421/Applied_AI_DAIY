---
id: ARC-004
title: Subsystem Case guidance
refines: ARC-001
forced_by:
  - FREE-TEXT-INPUT
  - OPTIONAL-PHOTO
  - INPUT-USES-PROFILE
  - INPUT-USES-INVENTORY
  - SETUP-NEVER-BLOCKS
  - THREE-STEP-START
  - NO-PROMPT-SKILL-NEEDED
  - FOLLOW-UP-QUESTIONS
  - REDUNDANT-ENTRY
  - NO-ASSUMPTIONS-AS-FACTS
  - UNDERSTANDABLE-ERROR-NOTICE
  - NO-UNVALIDATED-OUTPUT
  - RISK-CHECK-FIRST
  - PRECHECK-COVERS-FOLLOW-UP-ANSWERS
  - STEP-CHECK-OFF
  - STEP-RE-EXPLAIN
  - FOLLOW-UP-DURING-EXECUTION
  - STEP-QUESTION-HAZARD-CHECK
  - PROJECT-HISTORY
  - GO-BACK
  - DEFAULT-BEGINNER
  - DETAIL-FOLLOWS-PROFILE
  - RESPONSE-TIME
  - UC-001
  - UC-002
  - UC-003
  - UC-004
  - UC-011
  - UC-016
  - UC-017
designs:
  - MOD-case-pipeline
  - MOD-case-session
---
# ARC-004 Subsystem Case guidance

## Context

A case passes through rounds of questions, an answer, explanations at the user's level, and the work itself with check-offs, explanations again and questions (UC-001 to UC-004). On the server, each request must run the filters of ARC-001 in a fixed order. On the client, the progress of a case must be kept as the project history (PROJECT-HISTORY). The case must be resumable after going back or a restart (GO-BACK, STEP-CHECK-OFF), and answers given earlier must be offered again (REDUNDANT-ENTRY).

## Decision

**Responsibility:** Case guidance carries one case from its input to a validated outcome, and through its execution. On the server it runs the pipe of filters. On the client it keeps the state of the case and stores it as a case record.

**Interface it offers:**

- Server functions of MOD-case-pipeline, which are remote calls over HTTPS:
  - `assessCase(CaseRequest): CaseOutcome`
  - `explainSteps(ExplainRequest): ExplainOutcome`
  - `answerStepQuestion(StepQuestionRequest): StepAnswerOutcome`
- The client hook `useCaseSession(caseId?)` of MOD-case-session. The User interface uses it to start, answer, choose an option, explain, re-explain, ask, check off, add notes, set a budget, record used materials and complete a case.

**Modules:**

| Module | Responsibility | Runs on |
|---|---|---|
| MOD-case-pipeline | Order and run the filters for each AI request, and turn every failure into a notice outcome | server |
| MOD-case-session | Keep the state of the open case, build its requests, and save it as a case record | client |

MOD-case-pipeline uses:

- MOD-hazard-precheck, MOD-output-check, MOD-safety-enforcement, MOD-legal-notices and MOD-case-model from the Case domain;
- MOD-ai-tasks from AI access, and the error type `AiError` of MOD-ai-gateway.

MOD-case-session uses MOD-case-pipeline through its server functions, MOD-history, MOD-profile and MOD-inventory from Personal data, and MOD-case-model.

The server keeps no case state. Each request carries the description, the photo, all answers, the round and the inventory snapshot. Explanation requests carry the steps and one skill level.

**Principles:** pipe-and-filter on the server; client-server split; YAGNI, no server-side case store; one responsibility per module.

## Alternatives

- **A server-side case store with a case id.** Rejected: the server would store case data of users without an account, against PROFILE-ON-DEVICE and DATA-MINIMISATION. Requests would also no longer be stateless.
- **Running the pipeline in the browser and calling the AI through a thin proxy.** Rejected: a modified client could skip the pre-check or the checks (RISK-CHECK-FIRST, NO-UNVALIDATED-OUTPUT).
- **A state machine library for the case flow.** Rejected: the flow has four outcomes and a round counter. A hook with plain state is enough (KISS).

## Consequences

- A case survives a reload and a change of device through its case record, though the photo survives only under consent (ARC-015).
- The client cannot change which filters run. It can only send a different request, which is checked again.
- Requests are larger, because each round resends the whole case.
