import type { Quantity, Unit } from "../case-model";

// Conversion within length, volume and mass. Area and pieces are not converted.
const FAMILIES: Record<Unit, { family: string; factor: number }> = {
  piece: { family: "piece", factor: 1 },
  m2: { family: "m2", factor: 1 },
  mm: { family: "length", factor: 1 },
  cm: { family: "length", factor: 10 },
  m: { family: "length", factor: 1000 },
  ml: { family: "volume", factor: 1 },
  l: { family: "volume", factor: 1000 },
  g: { family: "mass", factor: 1 },
  kg: { family: "mass", factor: 1000 },
};

export function compatible(a: Unit, b: Unit): boolean {
  return FAMILIES[a].family === FAMILIES[b].family;
}

/** The amount of `q` in `unit`, or null when the units are incompatible. */
export function convert(q: Quantity, unit: Unit): number | null {
  if (!compatible(q.unit, unit)) return null;
  return (q.amount * FAMILIES[q.unit].factor) / FAMILIES[unit].factor;
}
