import { useSyncExternalStore } from "react";

import { SKILL_AREAS, type SkillArea, type SkillLevel } from "../case-model";
import { localStore } from "../local-store";

export type SkillProfile = { levels: Partial<Record<SkillArea, SkillLevel>> };

const ID = "profile";
const EMPTY: SkillProfile = { levels: {} };

const LEVELS: SkillLevel[] = ["beginner", "some-experience", "experienced"];

/**
 * The stored profile, reduced to what is valid. A record of another shape (an older version, a hand
 * edit) must not take the skills page down: unknown areas and levels are left out.
 */
export function getProfile(): SkillProfile {
  const stored: unknown = localStore.get<unknown>("profile", ID)?.data;
  const raw = (stored as { levels?: unknown } | null | undefined)?.levels;
  const levels: SkillProfile["levels"] = {};
  if (raw && typeof raw === "object") {
    for (const area of SKILL_AREAS) {
      const level = (raw as Record<string, unknown>)[area];
      if (LEVELS.includes(level as SkillLevel)) levels[area] = level as SkillLevel;
    }
  }
  return { levels };
}

export function levelFor(area: SkillArea): SkillLevel {
  return getProfile().levels[area] ?? "beginner";
}

export function setLevel(area: SkillArea, level: SkillLevel): void {
  localStore.put<SkillProfile>("profile", ID, {
    levels: { ...getProfile().levels, [area]: level },
  });
}

export function clearLevel(area: SkillArea): void {
  const levels = { ...getProfile().levels };
  if (levels[area] === undefined) return;
  delete levels[area];
  localStore.put<SkillProfile>("profile", ID, { levels });
}

let cached: SkillProfile = EMPTY;
let cachedKey = JSON.stringify(EMPTY);

function snapshot(): SkillProfile {
  const profile = getProfile();
  const key = JSON.stringify(profile);
  if (key !== cachedKey) {
    cached = profile;
    cachedKey = key;
  }
  return cached;
}

function subscribe(listener: () => void): () => void {
  return localStore.subscribe((c) => {
    if (c === "profile") listener();
  });
}

export function useProfile(): SkillProfile {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}
