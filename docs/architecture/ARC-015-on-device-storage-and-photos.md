---
id: ARC-015
title: On-device storage and photos
refines: ARC-001
forced_by:
  - PROFILE-ON-DEVICE
  - INVENTORY-ON-DEVICE
  - OPTIONAL-PHOTO
  - DEVICE-STORAGE-CONSENT
  - CONSENT-WITHDRAWAL
  - DATA-MINIMISATION
  - PROJECT-HISTORY
  - UC-001
  - UC-013
  - UC-014
  - UC-016
  - UC-020
---
# ARC-015 On-device storage and photos

## Context

The requirements on device storage:

- profile and inventory are stored on the device, and the check of PROFILE-ON-DEVICE inspects localStorage;
- the inventory persists across restarts (INVENTORY-ON-DEVICE);
- a photo is optional (OPTIONAL-PHOTO), and photos can be several megabytes, while localStorage holds a few megabytes in total;
- storage on the device needs a basis (DEVICE-STORAGE-CONSENT);
- the app must not collect data it does not need (DATA-MINIMISATION).

## Decision

- **Records:** profile, inventory, tools, case records, consents and the sync marks are stored as JSON in localStorage under keys `daiy.v1.<name>`.
- **Photos:**
  - before upload, the photo is downscaled on the device to at most 1600 pixels on the long side and encoded as JPEG, using the browser's canvas API with no library;
  - it is sent with the case request and kept in memory for the open case;
  - it is stored after the case only with the consent `keep-case-photos`, in IndexedDB through `idb-keyval` (npm).
- **The server and the provider:** the server never stores a photo, and the AI provider receives it only within the request.
- **The register:** MOD-local-store holds the register that names, for every key and blob kind, its basis: the function it is strictly necessary for, or the consent kind that covers it.

**Principles:** repository pattern; KISS; data minimisation by design.

## Alternatives

| Alternative | Ecosystem | Why not |
|---|---|---|
| IndexedDB through Dexie for everything | npm | Asynchronous everywhere, and the PROFILE-ON-DEVICE check names localStorage. |
| The Origin Private File System for photos | Web platform | Less browser support for what is a key-value need. |
| Raw IndexedDB without a library | Web platform | Possible. `idb-keyval` is a few hundred bytes and removes boilerplate. |
| Keeping photos without asking | — | A photo is not needed for the history's function, against DEVICE-STORAGE-CONSENT and DATA-MINIMISATION. |

## Consequences

- Without consent, a photo is gone after a reload. The case record notes that a photo was attached, and the next round goes on without it.
- If localStorage is full, a write fails with `StorageFullError`, and the user is told in a status message.
