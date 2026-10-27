---
id: ARC-006
title: Subsystem Personal data
refines: ARC-001
forced_by:
  - SKILL-PROFILE
  - DEFAULT-BEGINNER
  - PROFILE-ON-DEVICE
  - MATERIAL-INVENTORY
  - TOOL-INVENTORY
  - INVENTORY-ON-DEVICE
  - DEDUCT-CONSUMED
  - OFFER-SAVE-OWNED-ITEMS
  - PROJECT-HISTORY
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - DATA-RECTIFICATION
  - DATA-MINIMISATION
  - USE-WITHOUT-ACCOUNT
  - SETUP-NEVER-BLOCKS
  - UC-009
  - UC-013
  - UC-014
  - UC-015
  - UC-016
  - UC-017
  - UC-020
  - UC-021
designs:
  - MOD-local-store
  - MOD-consent
  - MOD-profile
  - MOD-inventory
  - MOD-history
---
# ARC-006 Subsystem Personal data

## Context

Several requirements govern the data kept on the device:

- the profile and the inventory are stored on the device and persist across restarts (PROFILE-ON-DEVICE, INVENTORY-ON-DEVICE, MATERIAL-INVENTORY, TOOL-INVENTORY, SKILL-PROFILE);
- projects are kept with their steps, materials and notes (PROJECT-HISTORY);
- every item stored on the device is strictly necessary for a requested function or covered by a recorded consent, and a consent can be withdrawn in one action (DEVICE-STORAGE-CONSENT, CONSENT-WITHDRAWAL);
- the stored data can be corrected (DATA-RECTIFICATION);
- sync, export and delete-all need all of this data in one place (ARC-001, repository pattern).

## Decision

**Responsibility:** Personal data is the repository of the user's data on the device: the skill profile, the material and tool inventory, the case records and the consents. It also keeps the register that names the basis for every stored item.

**Interface it offers:**

- `localStore` (MOD-local-store): records by collection with tombstones, change subscription, blobs, the storage register, and `clearAll`;
- `getProfile`, `levelFor`, `setLevel`, `clearLevel` and `useProfile` (MOD-profile);
- `listMaterials`, `saveMaterial`, `removeMaterial`, `listTools`, `saveTool`, `removeTool`, `deduct`, `snapshot` and `useInventory` (MOD-inventory);
- `listCases`, `getCase`, `saveCase`, `removeCase`, `savePhoto`, `getPhoto` and `useHistory` (MOD-history);
- `listConsents`, `hasConsent`, `giveConsent`, `withdrawConsent`, `registerPurge`, `clearConsents` and `useConsents` (MOD-consent).

**Modules:**

| Module | Responsibility |
|---|---|
| MOD-local-store | The storage of records and blobs on the device, and the register of what is stored on which basis |
| MOD-consent | Consent kinds and the recorded consents: give, withdraw, purge on withdrawal |
| MOD-profile | Skill level per area, with beginner as the default |
| MOD-inventory | Materials with name, quantity, unit and location; tools; validation; deduction |
| MOD-history | Case records: ongoing and completed projects with steps, check-offs, materials used, notes, and an optional photo |

MOD-profile, MOD-inventory and MOD-history use MOD-local-store and MOD-case-model. MOD-local-store uses MOD-consent. MOD-consent stores its own records directly in localStorage and calls back the purge handlers registered with it, so no cycle arises.

Storage is localStorage for records and IndexedDB for photos (ARC-015). Every item is strictly necessary for a function the user requested, except case photos kept after a case, which need the consent `keep-case-photos`.

**Principles:** repository pattern; one responsibility per module; modules without a cycle, a callback instead of a mutual import; YAGNI.

## Alternatives

- **Each feature module writes its own localStorage keys.** Rejected: export, delete-all, sync and the consent register would each need to know every key, so a new key would mean changing four places.
- **IndexedDB through Dexie for all data.** Rejected: the check of PROFILE-ON-DEVICE names localStorage, and the record volume is small (ARC-015).
- **No consent mechanism, because everything is necessary.** Rejected: keeping the photo of a finished case is not necessary for the history (PROJECT-HISTORY names steps, materials and notes). UC-020 must remain possible.

## Consequences

- The register makes the review of DEVICE-STORAGE-CONSENT a reading of one table.
- localStorage limits the total to a few megabytes. Photos are therefore kept apart, and only under consent.
- Records carry `updatedAt` and tombstones even without an account, so sync can start at any time without migration.
