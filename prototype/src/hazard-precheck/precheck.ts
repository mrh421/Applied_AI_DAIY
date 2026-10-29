import type { Escalation, HazardKind } from "../case-model";
import { CATALOGUE, OPENS_HOUSING } from "./catalogue";
import type { CatalogueEntry } from "./catalogue";

const GENERIC_ACTIONS = [
  "Stop the work",
  "Contact a qualified professional of the trade concerned",
];
const GENERIC_PROFESSIONALS = ["Qualified professional of the trade concerned"];

export function detectHazards(text: string): HazardKind[] {
  return CATALOGUE.filter((e) => [...e.en, ...e.de].some((p) => p.test(text))).map((e) => e.kind);
}

export function opensHousing(text: string): boolean {
  return [...OPENS_HOUSING.en, ...OPENS_HOUSING.de].some((p) => p.test(text));
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function escalationFor(kinds: HazardKind[], origin: "precheck" | "output"): Escalation {
  const hazards = unique(kinds);
  const entries = CATALOGUE.filter((e) => hazards.includes(e.kind));
  if (entries.length === 0) {
    return {
      risk: "high",
      reason:
        "No instructions are given because the risk of this work cannot be judged as safe. Stop the work and let a qualified professional look at it.",
      hazards: [],
      actions: GENERIC_ACTIONS,
      professionals: GENERIC_PROFESSIONALS,
      origin,
    };
  }
  const emergencyFirst = (list: CatalogueEntry[]) => [
    ...list.filter((e) => e.emergency),
    ...list.filter((e) => !e.emergency),
  ];
  const ordered = emergencyFirst(entries);
  const emergency = ordered.some((e) => e.emergency);
  return {
    risk: emergency ? "critical" : "high",
    reason: `No instructions are given. ${ordered.map((e) => `${capitalise(e.label)}: ${e.why}`).join(" ")}`,
    hazards,
    actions: unique(ordered.flatMap((e) => e.actions)),
    professionals: unique(ordered.map((e) => e.professional)),
    origin,
  };
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function precheck(texts: string[]): Escalation | null {
  const kinds = detectHazards(texts.join("\n"));
  return kinds.length === 0 ? null : escalationFor(kinds, "precheck");
}
