---
id: MOD-ai-gateway
title: Call the AI provider
folder: prototype/src/ai-gateway/
realises:
  - UNDERSTANDABLE-ERROR-NOTICE
  - RESPONSE-TIME
  - OPTIONAL-PHOTO
  - OUTPUT-FORMAT-CHECK
follows:
  - ARC-003
  - ARC-010
uses:
provides:
  - AiErrorCode
  - AiError
  - AiContent
  - generateJson
---
# MOD-ai-gateway Call the AI provider

## Responsibility

It belongs to AI access (ARC-003). It sends one schema-constrained request to the configured AI model and returns its JSON output, mapping every provider failure to `AiError`.

## Parts

- `index.ts`: the interface.
- `gateway.ts`: `generateJson` and the error mapping.
- `config.ts`: reads the environment.
- `*.test.ts`: unit tests against a local stub server. Each HTTP status maps to its code; a timeout maps to `timeout`; the schema is passed to the SDK.

## Data

None stored. The configuration comes from environment variables: `AI_PROVIDER_API_KEY`, `AI_MODEL`, `AI_TIMEOUT_MS` and the optional `AI_BASE_URL`.

## Interfaces

- `AiErrorCode` — `'config' | 'quota' | 'rate-limit' | 'refused' | 'invalid-output' | 'timeout' | 'unavailable'`.
- `AiError` — `class AiError extends Error { readonly code: AiErrorCode }`.
- `AiContent` — `{ type: 'text'; text: string } | { type: 'image'; mediaType: 'image/jpeg'; dataBase64: string }`.
- `generateJson(opts: { system: string; content: AiContent[]; schema: ZodTypeAny; timeoutMs?: number }): Promise<unknown>` — a remote call over HTTPS to the provider. It never returns partial output. It rejects with `AiError`:

| Code | When |
|---|---|
| `config` | Key or model missing, or HTTP 401 |
| `quota` | HTTP 402 |
| `rate-limit` | HTTP 429 |
| `refused` | HTTP 403, or the model refuses |
| `invalid-output` | No JSON, or the output does not match the schema |
| `timeout` | The call takes longer than `timeoutMs`, by default `AI_TIMEOUT_MS` |
| `unavailable` | Network failure or HTTP 5xx |

**Errors a caller handles:** `AiError`, by its `code`.

## Files

It reads and writes no file.

## Uses

No DAIY module. It uses the libraries `ai` and `@ai-sdk/anthropic` (ARC-010).
