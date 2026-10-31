import type { Guide } from "../case-model";
import type { MaterialItem, ToolItem } from "../inventory";
import { billOfMaterials, toolList } from "./bill";
import { matchMaterial, matchTool, ownStockFirst } from "./match";
import type { MaterialMatch, StockStatus, ToolMatch } from "./match";

export type { MaterialMatch, StockStatus, ToolMatch };

export type StockMatch = {
  materials: MaterialMatch[];
  ownedTools: ToolMatch[];
  missingTools: ToolMatch[];
};

/** Matches the materials and tools of the guides against the inventory. Total, no errors. */
export function matchStock(
  guides: Guide[],
  inventory: { materials: MaterialItem[]; tools: ToolItem[] },
): StockMatch {
  const materials = ownStockFirst(
    billOfMaterials(guides).map((need) => matchMaterial(need, inventory.materials)),
  );
  const tools = toolList(guides).map((need) => matchTool(need, inventory.tools));
  return {
    materials,
    ownedTools: tools.filter((t) => t.inventoryToolId !== null),
    missingTools: tools.filter((t) => t.inventoryToolId === null),
  };
}
