---
id: MOD-legal-notices
title: Legal notice catalogue
folder: prototype/src/legal-notices/
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
follows:
  - ARC-002
uses:
  - MOD-case-model.NoticeKind
  - MOD-case-model.Notice
provides:
  - noticesFor
---
# MOD-legal-notices Legal notice catalogue

## Responsibility

It belongs to the Case domain (ARC-002). It gives the fixed text and the marks of each legal notice kind that a case touches.

## Parts

- `index.ts`: the interface.
- `catalogue.ts`: per `NoticeKind`, a text for `applies`, a text for `possible` and the marks.
- `notices.ts`: `noticesFor`.
- `*.test.ts`: unit tests. Each kind yields its text and marks; `possible` uses the possibility wording; duplicates are merged and several kinds stay separate; no text states that a permit-free project is free of rules.

## Data

| Kind | Content | Marks |
|---|---|---|
| `location-dependent-rule` | The rule depends on the location and is not stated as fact. | `check-locally` |
| `permit-free` | No building permit does not mean no rules. Other requirements still apply: neighbour law, fire protection, product rules. | — |
| `heating-or-flue-change` | Installing, changing or recommissioning a heating appliance or flue system: the owner must notify the district chimney sweep. | — |
| `heating-or-flue-decommission` | Permanently taking one out of operation: the owner must notify the district chimney sweep. | — |
| `firing-installation` | After installing, substantially changing or switching the fuel of a firing installation, a chimney sweep must verify that it meets its requirements. | — |
| `planting-near-boundary` | Boundary distances apply. | `check-locally` |
| `boundary-installation` | The neighbour's consent may be required. | — |
| `rented-property` | Inform the landlord. | — |
| `tenant-modification-right` | For accessibility, EV charging, burglary protection or plug-in solar, the tenant can demand the landlord's permission. | — |
| `warranty-or-funding` | Possible effect on warranty or funding. | `check-with-manufacturer-or-funding-body` |

The `possible` texts word each notice as a possibility (UC-024 A3).

## Interfaces

- `noticesFor(found: { kind: NoticeKind; certainty: 'applies' | 'possible' }[]): Notice[]` — one notice per distinct kind, in catalogue order (UC-024 A2). A kind found with both certainties is given as `applies`. An empty input returns an empty list.

**Errors a caller handles:** none.

## Files

It reads and writes no file.

## Uses

- `MOD-case-model.NoticeKind` and `MOD-case-model.Notice` — the kinds it receives and the notices it returns.
