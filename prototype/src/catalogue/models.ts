import { z } from "zod";

import type { MaterialNeed } from "../case-model";
import { checkLink } from "../link-check";
import models from "../../data/catalogue/models.json";
import { modelEntrySchema, type ModelEntry } from "./schema";
import { matchesRequirements } from "./spec-match";

const MODELS: ModelEntry[] = z.array(modelEntrySchema).parse(models);

const filled = (s: string) => s.trim().length > 0;

/** 3D-MODEL-DETAILS: dimensions, material requirements, licence, intended use and link must all be given. */
function isComplete(m: ModelEntry): boolean {
  const d = m.dimensionsMm;
  const hasDimension = [d.length, d.width, d.height, d.diameter].some(
    (v) => v !== undefined && v > 0,
  );
  return (
    hasDimension &&
    [m.materialRequirements, m.licence, m.intendedUse, m.url, m.provider].every(filled)
  );
}

async function reachable(url: string): Promise<boolean> {
  try {
    return (await checkLink({ url })).reachable;
  } catch {
    return false;
  }
}

/** Models that match the need, are complete and have a reachable link. Never rejects. */
export async function findModels(
  entries: readonly ModelEntry[],
  need: MaterialNeed,
): Promise<ModelEntry[]> {
  const candidates = entries.filter(
    (m) =>
      isComplete(m) &&
      matchesRequirements(need.name, need.spec, {
        title: m.title,
        dimensionsMm: m.dimensionsMm,
        material: m.spec.material,
        function: m.spec.function,
      }),
  );
  const checks = await Promise.all(candidates.map((m) => reachable(m.url)));
  return candidates.filter((_, i) => checks[i]);
}

export async function searchModels(need: MaterialNeed): Promise<ModelEntry[]> {
  if (!need.printable || need.safetyCritical !== "no") return [];
  return findModels(MODELS, need);
}
