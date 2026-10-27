---
id: MOD-consent
title: Recorded consents
folder: prototype/src/consent/
realises:
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - DELETE-ALL-DATA
  - UC-020
follows:
  - ARC-006
  - ARC-015
uses:
provides:
  - ConsentKind
  - ConsentRecord
  - CONSENT_PURPOSES
  - listConsents
  - hasConsent
  - giveConsent
  - withdrawConsent
  - registerPurge
  - clearConsents
  - useConsents
---
# MOD-consent Recorded consents

## Responsibility

It belongs to Personal data (ARC-006). It records which consent the user has given or withdrawn, and starts the removal of data stored under a consent when it is withdrawn.

## Parts

- `index.ts`: the interface.
- `consent.ts`: the records and the purge handlers.
- `*.test.ts`: unit tests. Give, then withdraw, records both; withdrawing runs the purge; giving again works with the same single call; `clearConsents` leaves no key.

## Data

The consent records, stored in localStorage under `daiy.v1.consents`, which is strictly necessary to honour the consents. The plain-language purposes of `CONSENT_PURPOSES`.

## Interfaces

- `ConsentKind` — `'keep-case-photos'`.
- `ConsentRecord` — `{ kind: ConsentKind; given: boolean; at: string }`.
- `CONSENT_PURPOSES: Record<ConsentKind, string>` — the plain-language purpose shown when asking.
- `listConsents(): ConsentRecord[]` — every recorded consent.
- `hasConsent(kind: ConsentKind): boolean` — whether the consent is given now.
- `giveConsent(kind: ConsentKind): void` — one action.
- `withdrawConsent(kind: ConsentKind): Promise<void>` — one action; records the withdrawal, then runs the registered purge handlers.
- `registerPurge(kind: ConsentKind, handler: () => Promise<void>): void` — a handler run on withdrawal.
- `clearConsents(): void` — removes every record.
- `useConsents(): ConsentRecord[]` — the records as a React hook.

**Errors a caller handles:** if a purge handler rejects, `withdrawConsent` passes the rejection on; the withdrawal stays recorded, and nothing more is stored under the consent.

## Files

localStorage key `daiy.v1.consents`, read and written.

## Uses

No other module.
