---
id: ARC-010
title: AI provider and structured output
refines: ARC-001
forced_by:
  - OPTIONAL-PHOTO
  - OUTPUT-FORMAT-CHECK
  - RESPONSE-TIME
  - PRIVACY-NOTICE
  - PRECHECK-GERMAN
  - PRECHECK-ENGLISH
  - UC-001
  - UC-003
  - UC-004
---
# ARC-010 AI provider and structured output

## Context

The prototype calls the Lovable AI gateway (`@ai-sdk/openai` against `ai.gateway.lovable.dev`). The Lovable project is frozen, and the prototype's README leaves the replacement of the gateway to an architecture decision. The tasks of ARC-003 need:

- image input (OPTIONAL-PHOTO);
- JSON output constrained by a schema (OUTPUT-FORMAT-CHECK);
- German and English, the languages of the cases (PRECHECK-GERMAN, PRECHECK-ENGLISH);
- a short response time (RESPONSE-TIME).

The provider receives personal data and is a recipient under PRIVACY-NOTICE.

## Decision

- **SDK:** the Vercel AI SDK `ai` (npm) with the provider package `@ai-sdk/anthropic`.
- **Model:** Claude Sonnet 5.5, `claude-sonnet-5-5`, chosen for latency and vision. It is set by the environment variable `AI_MODEL`, with the key in `AI_PROVIDER_API_KEY` and an optional `AI_BASE_URL` for the test stub.
- **Structured output:** each task calls the SDK's structured output with the task's zod schema from MOD-case-model. No tools are declared.
- **Timeout:** each call has a timeout, `AI_TIMEOUT_MS`, which serves the agreed response target. A timeout becomes `AiError` code `timeout`, and the user sees an understandable notice.
- **Validation:** the SDK's own schema parsing only guides generation. MOD-output-check remains the check of record.
- **Location:** MOD-ai-gateway is the only module that imports `ai` or `@ai-sdk/anthropic`.

**Principles:** an interface hides its implementation; a remote interface names how it fails; KISS, no agent framework.

## Alternatives

| Alternative | Ecosystem | Why not |
|---|---|---|
| Keep the Lovable gateway with `@ai-sdk/openai` | npm | A frozen platform. An extra intermediary recipient of personal data. Credits are tied to Lovable. |
| OpenAI API directly with `@ai-sdk/openai` | npm | Technically equivalent. Kept as a fallback: switching changes only MOD-ai-gateway and its configuration. |
| Mistral API with `@ai-sdk/mistral` | npm | Hosted in the EU, which helps PRIVACY-NOTICE. Vision and structured output on par to be confirmed by the evaluation cases. Also a fallback. |
| The provider's own SDK, `@anthropic-ai/sdk` | npm | It ties the code to one provider, where the AI SDK keeps the provider swappable in one module. |
| LangChain | npm and Python | Agent orchestration that the tasks do not need (YAGNI). |

## Consequences

- A data processing agreement with the provider is needed, and the provider is named in the privacy notice as a recipient.
- The model choice is confirmed or changed by the evaluation cases for classification quality and the 95th-percentile response time, without a code change.
- The prompt version and the model name are logged with each outcome type, without case text, so results can be traced.
