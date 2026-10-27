---
id: ARC-014
title: Sync by records, newest change wins
refines: ARC-001
forced_by:
  - ACCOUNT-SYNC
  - DATA-RECTIFICATION
  - DELETE-ALL-DATA
  - DATA-MINIMISATION
  - UC-018
  - UC-021
  - UC-023
---
# ARC-014 Sync by records, newest change wins

## Context

Profile, inventory and history sync across the devices of an account (ACCOUNT-SYNC). The use case sets three conditions:

- a change made offline syncs later (UC-018 A3);
- when the same item was changed on two devices, the newer change is kept (UC-018 A4);
- corrections and deletions reach the other devices (UC-021 A1).

The device stores records with `id`, `updatedAt` and a deletion tombstone (MOD-local-store).

## Decision

- **Unit:** one record, of the collections `profile`, `materials`, `tools` or `cases`. Photos and consents are never synced.
- **Push:** the client sends every record whose `updatedAt` is later than its last successful push. The server stores a record if no copy exists, or if the incoming `updatedAt` is later than the stored one. Ties keep the stored copy.
- **Pull:** the server gives every record a growing sequence number when it stores it. The client asks for records after its last cursor and applies them with the same rule.
- **Order:** push, then pull, triggered at app start, after local changes (debounced by 2 s), when the device comes back online, and on demand.
- **Offline:** a failed push leaves the last-push mark unchanged, so the changes are sent next time. Nothing blocks the user.
- **Tombstones:** kept for 90 days, then removed on both sides.

**Principles:** KISS; YAGNI; a remote interface names how it fails.

## Alternatives

| Alternative | Ecosystem | Why not |
|---|---|---|
| CRDT documents with Automerge or Yjs | npm | Merges concurrent edits field by field. UC-018 A4 asks only that the newer change be kept (YAGNI). |
| Uploading a whole snapshot per device | — | A concurrent change on another device would overwrite unrelated items. |
| Server time instead of device time for `updatedAt` | — | Offline changes have no server time. Device clocks are good enough for newer-wins between one person's devices. |

## Consequences

- A device with a clock far behind can lose to an older change. This is accepted for a single user's devices.
- A record larger than 256 KB is rejected by the server, and the sync state shows an error. Case records stay below this limit because photos are not part of them.
