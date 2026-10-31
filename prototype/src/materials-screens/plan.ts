import type { Guide, Money, PartSpec, Quantity, SolutionOption } from "../case-model";
import type { Datum } from "../catalogue";
import type { CaseRecord } from "../history";

/** The option the materials list is for: the chosen one, else the first (the best ranked). */
export function activeOption(record: CaseRecord): SolutionOption | null {
  if (record.outcome?.type !== "guidance") return null;
  const { options } = record.outcome;
  return options.find((o) => o.id === record.chosenOptionId) ?? options[0] ?? null;
}

export function guidesOf(option: SolutionOption): Guide[] {
  return option.packages.flatMap((p) => (p.guide ? [p.guide] : []));
}

export const money = (m: Money): string => `${m.amount.toFixed(2)} EUR`;

export const quantity = (q: Quantity): string => `${q.amount} ${q.unit}`;

/** A non-negative decimal number; a comma is read as the decimal point. */
export function parseAmount(text: string): number | null {
  const t = text.trim();
  if (!/^\d+([.,]\d*)?$/.test(t)) return null;
  return Number.parseFloat(t.replace(",", "."));
}

export function dimensions(d: NonNullable<PartSpec["dimensionsMm"]>): string {
  const parts = (["length", "width", "height", "diameter"] as const).flatMap((k) =>
    d[k] === undefined ? [] : [`${k} ${d[k]} mm`],
  );
  return parts.join(", ");
}

const LABEL = { "ai-estimate": "AI estimate", unverified: "unverified" } as const;

/** The certainty label of a datum as text; a verified datum names its source (DATA-CERTAINTY-LABELS). */
export function certaintyText<T>(d: Datum<T>): string {
  return d.certainty === "verified" ? `verified, source: ${d.source}` : LABEL[d.certainty];
}
