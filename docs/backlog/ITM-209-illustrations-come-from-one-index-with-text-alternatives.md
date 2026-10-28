---
id: ITM-209
title: Illustrations come from one index with text alternatives
level: module
realises:
  - ILLUSTRATIVE-IMAGES
  - TEXT-ALTERNATIVES
modules:
  - MOD-illustrations
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-illustrations.md
---
# ITM-209 Illustrations come from one index with text alternatives

**REGISTER**

## Outcome

`prototype/src/illustrations/` holds the index of illustrative images that a step may name, each with its text alternative; `illustration(id)` returns the image and its alternative, and an unknown id returns none.

## Acceptance

- Unit tests: every entry of the index has a non-empty text alternative and a file that exists; an unknown id gives no image.

## Priority

unrated (nothing it realises cites an old id with a MoSCoW row), planned for sprint 2 of the sprint split (docs/sprint-split.md)

It realises nothing with a sprint of its own, so it is planned with the earliest item that builds on it.
