import type { MaterialNeed, Quantity, ToolNeed } from "../case-model";
import type { MaterialItem, ToolItem } from "../inventory";
import { normalise } from "./bill";
import { convert, tidy } from "./units";

export type StockStatus =
  | { kind: "available" }
  | { kind: "partly-available"; missing: Quantity }
  | { kind: "missing"; missing: Quantity };

export type MaterialMatch = {
  need: MaterialNeed;
  inventoryItemId: string | null;
  held: Quantity | null;
  status: StockStatus;
};

export type ToolMatch = { need: ToolNeed; inventoryToolId: string | null };

const RANK: Record<StockStatus["kind"], number> = {
  available: 0,
  "partly-available": 1,
  missing: 2,
};

export function matchMaterial(need: MaterialNeed, items: MaterialItem[]): MaterialMatch {
  const unit = need.quantity.unit;
  const key = normalise(need.name);
  const usable = items.filter(
    (i) => normalise(i.name) === key && convert(i.quantity, unit) !== null,
  );
  const first = usable[0];
  if (!first) {
    return {
      need,
      inventoryItemId: null,
      held: null,
      status: { kind: "missing", missing: need.quantity },
    };
  }
  const amount = tidy(usable.reduce((sum, i) => sum + (convert(i.quantity, unit) ?? 0), 0));
  const held = { amount, unit };
  const rest = tidy(need.quantity.amount - amount);
  if (rest <= 0) return { need, inventoryItemId: first.id, held, status: { kind: "available" } };
  const status: StockStatus =
    amount > 0
      ? { kind: "partly-available", missing: { amount: rest, unit } }
      : { kind: "missing", missing: need.quantity };
  return { need, inventoryItemId: first.id, held, status };
}

/** Available first, then partly available, then missing; stable within a group (OWN-STOCK-FIRST). */
export function ownStockFirst(matches: MaterialMatch[]): MaterialMatch[] {
  return matches
    .map((m, i) => ({ m, i }))
    .sort((a, b) => RANK[a.m.status.kind] - RANK[b.m.status.kind] || a.i - b.i)
    .map((x) => x.m);
}

export function matchTool(need: ToolNeed, tools: ToolItem[]): ToolMatch {
  const key = normalise(need.name);
  const found = tools.find((t) => normalise(t.name) === key);
  return { need, inventoryToolId: found?.id ?? null };
}
