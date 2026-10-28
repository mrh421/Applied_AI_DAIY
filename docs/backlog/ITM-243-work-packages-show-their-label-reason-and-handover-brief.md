---
id: ITM-243
title: Work packages show their label, reason and handover brief
level: module
realises:
  - PACKAGE-LABEL
  - PACKAGE-REASON
  - HANDOVER-BRIEF
  - AGREE-WITH-PROFESSIONAL-BEFOREHAND
  - NOT-COLOR-ALONE
  - UC-010
modules:
  - MOD-case-screens
builds_on:
  - ITM-242
tests:
  - component
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-case-screens.md
---
# ITM-243 Work packages show their label, reason and handover brief

**REGISTER**

## Outcome

The outcome lists each work package with its label as word and icon, not colour alone, its short reason and the information that would change it; a professional package shows a handover brief to copy or send; a preparation package advises to agree it with the professional first.

## Acceptance

- Component tests: each label renders as text; a professional package has a brief; a preparation package carries the advice.
- Postcondition of UC-010: every work package carries exactly one of the four labels and a short reason.

## Priority

Must (from FR-14, FR-15, NFR-07, SAF-07), planned for sprint 8 of the sprint split (docs/sprint-split.md)

Its requirements belong to sprint 2; it is planned for sprint 4 because it builds on ITM-242, planned for sprint 4. Until then the prototype's code serves sprint 2.
