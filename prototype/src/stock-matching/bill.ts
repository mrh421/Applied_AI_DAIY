import type { Guide, MaterialNeed, ToolNeed } from "../case-model";
import { compatible, convert } from "./units";

export function normalise(name: string): string {
  return name.trim().toLowerCase();
}

/** The bill of materials of the guides: the same material, in compatible units, is added up. */
export function billOfMaterials(guides: Guide[]): MaterialNeed[] {
  const bill: MaterialNeed[] = [];
  for (const need of guides.flatMap((g) => g.materials)) {
    const key = normalise(need.name);
    const index = bill.findIndex(
      (b) => normalise(b.name) === key && compatible(b.quantity.unit, need.quantity.unit),
    );
    const total = bill[index];
    if (total === undefined) {
      bill.push(need);
      continue;
    }
    const added = convert(need.quantity, total.quantity.unit) ?? 0;
    // Rounded to absorb floating-point noise from unit conversion.
    const amount = Math.round((total.quantity.amount + added) * 1e9) / 1e9;
    bill[index] = { ...total, quantity: { amount, unit: total.quantity.unit } };
  }
  return bill;
}

/** The tools of the guides, each name once. */
export function toolList(guides: Guide[]): ToolNeed[] {
  const seen = new Set<string>();
  const tools: ToolNeed[] = [];
  for (const tool of guides.flatMap((g) => g.tools)) {
    const key = normalise(tool.name);
    if (seen.has(key)) continue;
    seen.add(key);
    tools.push(tool);
  }
  return tools;
}
