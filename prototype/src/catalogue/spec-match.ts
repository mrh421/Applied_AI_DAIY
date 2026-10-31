import type { PartSpec } from "../case-model";

type Dimensions = NonNullable<PartSpec["dimensionsMm"]>;
const KEYS = ["length", "width", "height", "diameter"] as const;

/** What a catalogue entry offers, as plain values. A missing value never meets a requirement. */
export type Candidate = {
  title: string;
  dimensionsMm?: Dimensions | undefined;
  material?: string | undefined;
  function?: string | undefined;
};

/** ±2 percent, or ±1 mm for values under 50 mm. */
function within(required: number, actual: number): boolean {
  const tolerance = required < 50 ? 1 : required * 0.02;
  return Math.abs(actual - required) <= tolerance + 1e-9;
}

/** Every stated dimension must be present on the candidate and within tolerance. */
export function dimensionsMatch(required: Dimensions, actual: Dimensions | undefined): boolean {
  return KEYS.every((k) => {
    const want = required[k];
    if (want === undefined) return true;
    const have = actual?.[k];
    return have !== undefined && within(want, have);
  });
}

const norm = (s: string) => s.trim().toLowerCase();

function hasRequirement(spec: PartSpec | undefined): spec is PartSpec {
  if (!spec) return false;
  const dims = spec.dimensionsMm;
  const hasDim = !!dims && KEYS.some((k) => dims[k] !== undefined);
  return hasDim || !!spec.material || !!spec.function;
}

/**
 * The one matcher for products and models. A stated requirement must be met.
 * When the spec states nothing, the item name must occur in the candidate's title.
 */
export function matchesRequirements(
  name: string,
  spec: PartSpec | undefined,
  candidate: Candidate,
): boolean {
  if (!hasRequirement(spec)) return norm(candidate.title).includes(norm(name));
  if (spec.dimensionsMm && !dimensionsMatch(spec.dimensionsMm, candidate.dimensionsMm)) {
    return false;
  }
  if (spec.material && norm(spec.material) !== norm(candidate.material ?? "")) return false;
  if (spec.function && norm(spec.function) !== norm(candidate.function ?? "")) return false;
  return true;
}
