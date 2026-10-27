---
id: MOD-profile
title: Skill profile
folder: prototype/src/profile/
realises:
  - SKILL-PROFILE
  - DEFAULT-BEGINNER
  - PROFILE-ON-DEVICE
  - DATA-RECTIFICATION
  - SETUP-NEVER-BLOCKS
follows:
  - ARC-006
  - ARC-011
uses:
  - MOD-local-store.localStore
  - MOD-case-model.SkillArea
  - MOD-case-model.SkillLevel
provides:
  - SkillProfile
  - getProfile
  - levelFor
  - setLevel
  - clearLevel
  - useProfile
---
# MOD-profile Skill profile

## Responsibility

It belongs to Personal data (ARC-006). It stores the user's skill level per area, and gives the level for an area with beginner as the default.

## Parts

- `index.ts`: the interface.
- `profile.ts`: the functions.
- `*.test.ts`: unit tests. Set, change and clear a level; an unset area gives beginner; the value persists across reload.

## Data

The profile is one record with the id `profile` in the collection `profile` of MOD-local-store.

## Interfaces

- `SkillProfile` — `{ levels: Partial<Record<SkillArea, SkillLevel>> }`.
- `getProfile(): SkillProfile` — the stored profile, empty when none exists.
- `levelFor(area: SkillArea): SkillLevel` — `'beginner'` where no level is set.
- `setLevel(area: SkillArea, level: SkillLevel): void` — stores a level.
- `clearLevel(area: SkillArea): void` — removes a level.
- `useProfile(): SkillProfile` — the profile as a React hook.

**Errors a caller handles:** `StorageFullError` from MOD-local-store, passed on.

## Files

Through MOD-local-store only, the key `daiy.v1.profile`. The profile is never sent to a server for storage, except as a synced record of an account (UC-013 A4).

## Uses

- `MOD-local-store.localStore` — reading and writing the profile record.
- `MOD-case-model.SkillArea` and `MOD-case-model.SkillLevel` — the areas and levels.
