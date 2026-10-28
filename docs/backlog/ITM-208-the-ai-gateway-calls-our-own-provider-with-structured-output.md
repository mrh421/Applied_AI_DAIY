---
id: ITM-208
title: The AI gateway calls our own provider with structured output
level: module
realises:
  - UNDERSTANDABLE-ERROR-NOTICE
  - RESPONSE-TIME
  - OPTIONAL-PHOTO
  - OUTPUT-FORMAT-CHECK
modules:
  - MOD-ai-gateway
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-ai-gateway.md and ARC-010
---
# ITM-208 The AI gateway calls our own provider with structured output

**REGISTER**

## Outcome

`prototype/src/ai-gateway/` offers `generateJson(schema, messages, photo?)`, which calls the provider chosen in ARC-010 with `AI_PROVIDER_API_KEY`, `AI_MODEL` and `AI_TIMEOUT_MS`, passes the output schema to the provider's structured output and an attached photo as image content, and maps every failure to an `AiError` with a code (timeout, rate limit, refused, malformed, unavailable) that the screens turn into an understandable notice.

## Acceptance

- Unit tests against a local stub server: each HTTP status maps to its code, a timeout maps to `timeout`, the schema is passed to the SDK, and a photo is sent as image content.
- `AI_BASE_URL` points the gateway at a stub, as the system tests of ARC-016 need.

## Priority

Must (from AIR-07, FR-01, NFR-04, SAF-03), planned for sprint 1 of docs/Implementation_Plan_EN.md
