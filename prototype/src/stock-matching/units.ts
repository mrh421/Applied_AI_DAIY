import type { Quantity, Unit } from "../case-model";

// Conversion within length, volume and mass. Area and pieces stand alone.
const FAMILY: Record<Unit, { family: string; factor: number }> = {
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
  return FAMILY[a].family === FAMILY[b].family;
}

/** The amount in the target unit, or null when the units are incompatible. */
export function convert(q: Quantity, to: Unit): number | null {
  if (!compatible(q.unit, to)) return null;
  return (q.amount * FAMILY[q.unit].factor) / FAMILY[to].factor;
}

/** Removes floating point noise from conversions such as 0.1 + 0.2. */
export function tidy(n: number): number {
  return Math.round(n * 1e9) / 1e9;
}
