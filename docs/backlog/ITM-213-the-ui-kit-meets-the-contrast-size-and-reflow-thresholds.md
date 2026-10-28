---
id: ITM-213
title: The UI kit meets the contrast, size and reflow thresholds
level: module
realises:
  - ADEQUATE-CONTRAST
  - LARGE-TEXT-CONTRAST
  - NON-TEXT-CONTRAST
  - NOT-COLOR-ALONE
  - READABLE-TEXT
  - REFLOW
  - REFLOW-NO-TWO-DIMENSIONAL-SCROLLING
  - TEXT-ALTERNATIVES
  - KEYBOARD-OPERABLE
  - FOCUS-VISIBLE
  - TARGET-SIZE
modules:
  - MOD-ui-kit
builds_on:
  - ITM-212
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-ui-kit.md (WCAG 2.2 A and AA)
---
# ITM-213 The UI kit meets the contrast, size and reflow thresholds

**REGISTER**

## Outcome

The colour tokens of `styles.css` and the kit meet 4.5:1 for text, 3:1 for large text and for controls and focus rings; `StatusBadge` shows a word or icon beside its colour; every control is reachable and operable by keyboard with a visible focus ring; pointer targets are at least 24 by 24 CSS pixels; layouts use relative units so that text at 200 percent and a width of 320 CSS pixels lose nothing and need no horizontal scrolling; `Img` requires a text alternative or marks the image decorative.

## Acceptance

- Unit tests: a contrast test over the token pairs; `StatusBadge` renders text; `Img` without `alt` and without `decorative` throws.
- An axe check of a page of every kit component reports no violation.

## Priority

Should (from NFR-07), planned for sprint 7 of docs/Implementation_Plan_EN.md
