import { useSyncExternalStore } from "react";

import type { SkillArea, SkillLevel } from "../case-model";
import { localStore } from "../local-store";

export type SkillProfile = { levels: Partial<Record<SkillArea, SkillLevel>> };

const ID = "profile";
const EMPTY: SkillProfile = { levels: {} };

export function getProfile(): SkillProfile {
  return localStore.get<SkillProfile>("profile", ID)?.data ?? { levels: {} };
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
