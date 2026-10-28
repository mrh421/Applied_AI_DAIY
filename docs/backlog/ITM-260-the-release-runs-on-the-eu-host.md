---
id: ITM-260
title: The release runs on the EU host
level: system
realises:
  - RESPONSE-TIME
modules:
  - MOD-app-shell
  - MOD-ai-gateway
  - MOD-sync-store
builds_on:
  - ITM-257
  - ITM-258
  - ITM-259
tests:
  - release
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/ARC-017
---
# ITM-260 The release runs on the EU host

**REGISTER**

## Outcome

The Node build runs as one process on the EU host with a persistent volume, HTTPS, secrets as environment variables and backups; logs hold request ids, outcome types, prompt version and errors but no case text, photo or credential. The release is tagged.

## Acceptance

- Release tests: CI green on the tag; a smoke run of the system tests against the host; a log sample holds no case text.
- The 95th-percentile response time measured on the host is within the agreed target.

## Priority

Should (from NFR-04), planned for sprint 8 of docs/Implementation_Plan_EN.md
