---
id: ITM-212
title: The UI kit holds the used components and nothing else
level: module
realises:
  - CLEAR-LABELS
  - ERROR-IDENTIFICATION
  - STATUS-MESSAGES
  - BASICS-EXPANDABLE
  - GO-BACK
modules:
  - MOD-ui-kit
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-ui-kit.md and ARC-009
---
# ITM-212 The UI kit holds the used components and nothing else

**REGISTER**

## Outcome

The shadcn components that a screen uses move from `components/ui/` into `prototype/src/ui-kit/`, wrapped as `Button`, `TextField`, `Select`, `Checkbox`, `Collapsible`, `StatusBadge`, `Img`, `Dialog`, `Page` and `announce`; the others and the dependencies no module uses (recharts, embla-carousel-react, react-day-picker, input-otp, cmdk, vaul, react-resizable-panels, @tanstack/react-query) are removed. A `TextField` always has a visible label and shows its error in text naming the field; `announce` speaks status messages through a live region; `Collapsible` can always be opened; `Page` has a back control.

## Acceptance

- Unit tests with Testing Library: a field without a label does not render; an error names its field; `announce` writes to a polite live region without moving focus; a collapsed section opens.
- `package.json` lists no dependency that no module uses, and the build passes.

## Priority

Must (from FR-03, NFR-07), planned for sprint 1 of docs/Implementation_Plan_EN.md
