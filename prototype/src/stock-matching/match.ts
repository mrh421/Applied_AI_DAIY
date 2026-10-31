import type { Guide, MaterialNeed, Quantity, ToolNeed } from "../case-model";
import type { MaterialItem, ToolItem } from "../inventory";
import { billOfMaterials, normalise, toolList } from "./bill";
import { compatible, convert } from "./units";

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

export type ToolMatch = {
  need: ToolNeed;
  inventoryToolId: string | null;
};

export type StockMatch = {
  materials: MaterialMatch[];
  ownedTools: ToolMatch[];
  missingTools: ToolMatch[];
};

type Inventory = { materials: MaterialItem[]; tools: ToolItem[] };

const EPSILON = 1e-9;
const round = (n: number) => Math.round(n * 1e9) / 1e9;
const RANK = { available: 0, "partly-available": 1, missing: 2 } as const;

function matchMaterial(need: MaterialNeed, items: MaterialItem[]): MaterialMatch {
  const required = need.quantity;
  const key = normalise(need.name);
  const same = items.filter(
    (i) => normalise(i.name) === key && compatible(i.quantity.unit, required.unit),
  );
  const heldAmount = round(
    same.reduce((sum, i) => sum + (convert(i.quantity, required.unit) ?? 0), 0),
  );
  const first = same[0];
  if (first !== undefined && heldAmount >= required.amount - EPSILON && heldAmount > 0) {
    return {
      need,
      inventoryItemId: first.id,
      held: { amount: heldAmount, unit: required.unit },
      status: { kind: "available" },
    };
  }
  if (first !== undefined && heldAmount > 0) {
    return {
      need,
      inventoryItemId: first.id,
      held: { amount: heldAmount, unit: required.unit },
      status: {
        kind: "partly-available",
        missing: { amount: round(required.amount - heldAmount), unit: required.unit },
      },
    };
  }
  return {
    need,
    inventoryItemId: first?.id ?? null,
    held: first ? { amount: 0, unit: required.unit } : null,
    status: { kind: "missing", missing: { ...required } },
  };
}

/** The bill of materials and the tool list of the guides, matched against the inventory. */
export function matchStock(guides: Guide[], inventory: Inventory): StockMatch {
  const materials = billOfMaterials(guides)
    .map((need) => matchMaterial(need, inventory.materials))
    // Array.prototype.sort is stable, so the order within a status is kept.
    .sort((a, b) => RANK[a.status.kind] - RANK[b.status.kind]);

  const ownedTools: ToolMatch[] = [];
  const missingTools: ToolMatch[] = [];
  for (const need of toolList(guides)) {
    const owned = inventory.tools.find((t) => normalise(t.name) === normalise(need.name));
    if (owned) ownedTools.push({ need, inventoryToolId: owned.id });
    else missingTools.push({ need, inventoryToolId: null });
  }
  return { materials, ownedTools, missingTools };
}
