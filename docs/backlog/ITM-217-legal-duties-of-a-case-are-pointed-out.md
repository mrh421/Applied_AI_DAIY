---
id: ITM-217
title: Legal duties of a case are pointed out
level: module
realises:
  - CHECK-LOCALLY
  - PERMIT-FREE-NOT-RULE-FREE
  - CHIMNEY-SWEEP-NOTICE-INSTALLATION
  - CHIMNEY-SWEEP-NOTICE-DECOMMISSIONING
  - FIRING-INSTALLATION-INSPECTION-NOTICE
  - PLANTING-BOUNDARY-DISTANCE
  - SHARED-BOUNDARY-CONSENT
  - TENANT-NOTICE
  - TENANT-MODIFICATION-RIGHT
  - WARRANTY-FUNDING-CHECK
  - UC-024
modules:
  - MOD-legal-notices
builds_on:
  - ITM-207
tests:
  - unit
origin:
  - Backlog run 1 (2026-10-28): drafted by Claude Code (Opus 5.5) by hand along Agent M's job kind propose-items and UC-032 steps 2 to 4, because the Backlog page has no Propose items button; from docs/architecture/MOD-legal-notices.md
---
# ITM-217 Legal duties of a case are pointed out

**REGISTER**

## Outcome

`prototype/src/legal-notices/` offers `noticesFor(caseFacts)`, which returns the notices a case touches: the chimney sweep for installing or decommissioning a firing installation and its inspection, the boundary distance of plants, consent for a shared boundary, the tenant's notice and right to modify, the check of warranty and funding, and that a permit-free project is not free of rules. Every location-dependent rule carries the mark "check locally".

## Acceptance

- Unit tests, one per notice, with a case that triggers it and one that does not; every location-dependent notice carries "check locally".
- Postcondition of UC-024: every duty or right the case touches is pointed out, and no answer presents a permit-free project as free of other requirements.

## Priority

Must (from AIR-10), planned for sprint 4 of the sprint split (docs/sprint-split.md)
