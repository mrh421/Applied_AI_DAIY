import type { Guide, MaterialNeed, ToolNeed } from "../case-model";
import { convert, tidy } from "./units";

export function normalise(name: string): string {
  return name.trim().toLowerCase();
}

/** One line per material; the same material across guides is added up (MATERIALS-LIST). */
export function billOfMaterials(guides: Guide[]): MaterialNeed[] {
  const lines: MaterialNeed[] = [];
  for (const need of guides.flatMap((g) => g.materials)) {
    const key = normalise(need.name);
    const line = lines.find(
      (l) => normalise(l.name) === key && convert(need.quantity, l.quantity.unit) !== null,
    );
    if (!line) {
      lines.push({ ...need });
      continue;
    }
    const add = convert(need.quantity, line.quantity.unit) ?? 0;
    line.quantity = { ...line.quantity, amount: tidy(line.quantity.amount + add) };
  }
  return lines;
}

/** Each tool once, by name. */
export function toolList(guides: Guide[]): ToolNeed[] {
  const seen = new Map<string, ToolNeed>();
  for (const tool of guides.flatMap((g) => g.tools)) {
    const key = normalise(tool.name);
    if (!seen.has(key)) seen.set(key, tool);
  }
  return [...seen.values()];
}
