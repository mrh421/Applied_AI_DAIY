import { describe, expect, it } from "vitest";

import type { Guide, MaterialNeed, ToolNeed, Unit } from "../case-model";
import type { MaterialItem, ToolItem } from "../inventory";
import { matchStock } from "./index";

function need(name: string, amount: number, unit: Unit, id = name): MaterialNeed {
  return {
    id,
    name,
    quantity: { amount, unit },
    spec: {},
    replacementPart: false,
    safetyCritical: "no",
    printable: false,
  };
}
function tool(name: string, id = name): ToolNeed {
  return { id, name, rentable: false };
}
function guide(materials: MaterialNeed[], tools: ToolNeed[] = []): Guide {
  return {
    diagnosis: "d",
    tools,
    materials,
    steps: [],
    estimatedMinutes: { min: 1, max: 2 },
    warnings: [],
  };
}
function item(name: string, amount: number, unit: Unit, id = name): MaterialItem {
  return { id, name, quantity: { amount, unit } };
}
const noInv = { materials: [] as MaterialItem[], tools: [] as ToolItem[] };

describe("MOD-stock-matching materials (INVENTORY-GROUNDING, PARTLY-AVAILABLE)", () => {
  it("marks held below the requirement as partly available with the missing rest", () => {
    const m = matchStock([guide([need("Screws", 10, "piece")])], {
      ...noInv,
      materials: [item("Screws", 4, "piece")],
    });
    expect(m.materials[0]?.status).toEqual({
      kind: "partly-available",
      missing: { amount: 6, unit: "piece" },
    });
    expect(m.materials[0]?.inventoryItemId).toBe("Screws");
    expect(m.materials[0]?.held).toEqual({ amount: 4, unit: "piece" });
  });

  it("marks held equal to the requirement as available", () => {
    const m = matchStock([guide([need("Screws", 10, "piece")])], {
      ...noInv,
      materials: [item("Screws", 10, "piece")],
    });
    expect(m.materials[0]?.status).toEqual({ kind: "available" });
  });

  it("marks held above the requirement as available", () => {
    const m = matchStock([guide([need("Screws", 10, "piece")])], {
      ...noInv,
      materials: [item("Screws", 11, "piece")],
    });
    expect(m.materials[0]?.status).toEqual({ kind: "available" });
  });

  it("marks an item not held as missing with the full quantity", () => {
    const m = matchStock([guide([need("Glue", 2, "ml")])], noInv);
    expect(m.materials[0]).toMatchObject({
      inventoryItemId: null,
      held: null,
      status: { kind: "missing", missing: { amount: 2, unit: "ml" } },
    });
  });

  it("matches names after trimming and case folding", () => {
    const m = matchStock([guide([need("  wood SCREWS ", 1, "piece")])], {
      ...noInv,
      materials: [item("Wood screws", 1, "piece")],
    });
    expect(m.materials[0]?.status.kind).toBe("available");
  });
});

describe("MOD-stock-matching units", () => {
  it("converts length, volume and mass", () => {
    const m = matchStock(
      [guide([need("Wire", 150, "cm"), need("Paint", 500, "ml"), need("Sand", 2000, "g")])],
      {
        ...noInv,
        materials: [item("Wire", 1, "m"), item("Paint", 0.5, "l"), item("Sand", 2, "kg")],
      },
    );
    const by = Object.fromEntries(m.materials.map((x) => [x.need.name, x.status]));
    expect(by["Wire"]).toEqual({ kind: "partly-available", missing: { amount: 50, unit: "cm" } });
    expect(by["Paint"]).toEqual({ kind: "available" });
    expect(by["Sand"]).toEqual({ kind: "available" });
  });

  it("counts an incompatible unit as missing with the full quantity", () => {
    const m = matchStock([guide([need("Wire", 2, "m")])], {
      ...noInv,
      materials: [item("Wire", 10, "kg")],
    });
    expect(m.materials[0]).toMatchObject({
      inventoryItemId: null,
      held: null,
      status: { kind: "missing", missing: { amount: 2, unit: "m" } },
    });
  });

  it("does not convert area or pieces", () => {
    const m = matchStock([guide([need("Tile", 2, "m2"), need("Nail", 2, "piece")])], {
      ...noInv,
      materials: [item("Tile", 200, "piece"), item("Nail", 2, "m2")],
    });
    expect(m.materials.map((x) => x.status.kind)).toEqual(["missing", "missing"]);
  });
});

describe("MOD-stock-matching aggregation and order (OWN-STOCK-FIRST)", () => {
  it("adds the same material across packages", () => {
    const m = matchStock(
      [guide([need("Screws", 6, "piece", "a")]), guide([need("screws", 6, "piece", "b")])],
      { ...noInv, materials: [item("Screws", 10, "piece")] },
    );
    expect(m.materials).toHaveLength(1);
    expect(m.materials[0]?.need.quantity).toEqual({ amount: 12, unit: "piece" });
    expect(m.materials[0]?.status).toEqual({
      kind: "partly-available",
      missing: { amount: 2, unit: "piece" },
    });
  });

  it("adds compatible units of the same material", () => {
    const m = matchStock([guide([need("Wire", 1, "m")]), guide([need("Wire", 50, "cm")])], noInv);
    expect(m.materials).toHaveLength(1);
    expect(m.materials[0]?.need.quantity).toEqual({ amount: 1.5, unit: "m" });
  });

  it("lists available, then partly available, then missing", () => {
    const m = matchStock(
      [guide([need("C", 1, "piece"), need("B", 5, "piece"), need("A", 1, "piece")])],
      { ...noInv, materials: [item("A", 1, "piece"), item("B", 2, "piece")] },
    );
    expect(m.materials.map((x) => x.status.kind)).toEqual([
      "available",
      "partly-available",
      "missing",
    ]);
  });
});

describe("MOD-stock-matching tools (MISSING-TOOLS-SEPARATE, TOOL-INVENTORY)", () => {
  it("splits owned and missing tools", () => {
    const m = matchStock([guide([], [tool("Drill"), tool("Saw")])], {
      ...noInv,
      tools: [{ id: "t1", name: " drill " }],
    });
    expect(m.ownedTools).toEqual([{ need: tool("Drill"), inventoryToolId: "t1" }]);
    expect(m.missingTools).toEqual([{ need: tool("Saw"), inventoryToolId: null }]);
  });

  it("lists a tool needed by several guides once", () => {
    const m = matchStock([guide([], [tool("Saw", "a")]), guide([], [tool("saw", "b")])], noInv);
    expect(m.missingTools).toHaveLength(1);
  });
});

describe("MOD-stock-matching empty input (SETUP-NEVER-BLOCKS)", () => {
  it("gives empty lists for no guides", () => {
    expect(matchStock([], noInv)).toEqual({ materials: [], ownedTools: [], missingTools: [] });
  });
  it("marks everything missing for an empty inventory", () => {
    const m = matchStock([guide([need("A", 1, "piece")], [tool("T")])], noInv);
    expect(m.materials[0]?.status.kind).toBe("missing");
    expect(m.missingTools).toHaveLength(1);
    expect(m.ownedTools).toEqual([]);
  });
});
