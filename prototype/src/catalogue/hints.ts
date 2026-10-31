import type { MaterialNeed, ToolNeed } from "../case-model";

/** RENT-OR-BORROW-HINT */
export function toolHint(need: ToolNeed): string | null {
  if (!need.rentable) return null;
  return `You may not need to buy ${need.name}: rent it at a hardware store or borrow it from a neighbour or a tool library.`;
}

/** NO-PRINTED-SAFETY-PARTS */
export function printedPartNote(need: MaterialNeed): string | null {
  if (!need.printable || need.safetyCritical !== "yes") return null;
  return `${need.name} is safety-critical. A 3D-printed part is recommended only together with a professional review.`;
}
