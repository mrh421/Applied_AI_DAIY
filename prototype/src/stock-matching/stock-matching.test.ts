import { describe, expect, it } from "vitest";

import type { Guide, MaterialNeed, Quantity, ToolNeed } from "../case-model";
import type { MaterialItem, ToolItem } from "../inventory";
import { matchStock } from "./index";

function need(name: string, quantity: Quantity, id = name): MaterialNeed {
  return {
    id,
    name,
    quantity,
    spec: {},
    replacementPart: false,
    safetyCritical: "no",
    printable: false,
  };
}
function tool(name: string): ToolNeed {
  return { id: name, name, rentable: false };
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
function item(id: string, name: string, quantity: Quantity): MaterialItem {
  return { id, name, quantity };
}
const noTools: ToolItem[] = [];

describe("matchStock quantities", () => {
  const g = [guide([need("Screws", { amount: 10, unit: "piece" })])];

  it("is available when held equals the requirement", () => {
    const r = matchStock(g, {
      materials: [item("a", "Screws", { amount: 10, unit: "piece" })],
      tools: noTools,
    });
    expect(r.materials[0]?.status).toEqual({ kind: "available" });
    expect(r.materials[0]?.inventoryItemId).toBe("a");
    expect(r.materials[0]?.held).toEqual({ amount: 10, unit: "piece" });
  });

  it("is available when held exceeds the requirement", () => {
    const r = matchStock(g, {
      materials: [item("a", "Screws", { amount: 25, unit: "piece" })],
      tools: noTools,
    });
    expect(r.materials[0]?.status).toEqual({ kind: "available" });
  });

  it("is partly available below the requirement, with the missing quantity", () => {
    const r = matchStock(g, {
      materials: [item("a", "Screws", { amount: 4, unit: "piece" })],
      tools: noTools,
    });
    expect(r.materials[0]?.status).toEqual({
      kind: "partly-available",
      missing: { amount: 6, unit: "piece" },
    });
  });

  it("is missing with the full quantity when not held or held at 0", () => {
    for (const materials of [[], [item("a", "Screws", { amount: 0, unit: "piece" })]]) {
      const r = matchStock(g, { materials, tools: noTools });
      expect(r.materials[0]?.status).toEqual({
        kind: "missing",
        missing: { amount: 10, unit: "piece" },
      });
    }
  });

  it("matches names after trimming and case folding", () => {
    const r = matchStock(g, {
      materials: [item("a", "  sCREWS ", { amount: 10, unit: "piece" })],
      tools: noTools,
    });
    expect(r.materials[0]?.status.kind).toBe("available");
  });

  it("sums several inventory items of the same name", () => {
    const r = matchStock(g, {
      materials: [
        item("a", "Screws", { amount: 4, unit: "piece" }),
        item("b", "screws", { amount: 6, unit: "piece" }),
      ],
      tools: noTools,
    });
    expect(r.materials[0]?.status.kind).toBe("available");
  });
});

describe("matchStock units", () => {
  it("converts length, volume and mass", () => {
    const cases: [Quantity, Quantity][] = [
      [
        { amount: 2, unit: "m" },
        { amount: 200, unit: "cm" },
      ],
      [
        { amount: 1, unit: "m" },
        { amount: 1000, unit: "mm" },
      ],
      [
        { amount: 500, unit: "ml" },
        { amount: 0.5, unit: "l" },
      ],
      [
        { amount: 1.5, unit: "kg" },
        { amount: 1500, unit: "g" },
      ],
    ];
    for (const [required, held] of cases) {
      const r = matchStock([guide([need("X", required)])], {
        materials: [item("a", "X", held)],
        tools: noTools,
      });
      expect(r.materials[0]?.status).toEqual({ kind: "available" });
    }
  });

  it("states the missing quantity in the unit of the requirement", () => {
    const r = matchStock([guide([need("Pipe", { amount: 2, unit: "m" })])], {
      materials: [item("a", "Pipe", { amount: 50, unit: "cm" })],
      tools: noTools,
    });
    expect(r.materials[0]?.status).toEqual({
      kind: "partly-available",
      missing: { amount: 1.5, unit: "m" },
    });
    expect(r.materials[0]?.held).toEqual({ amount: 0.5, unit: "m" });
  });

  it("counts an incompatible unit as missing with the full quantity", () => {
    const r = matchStock([guide([need("Paint", { amount: 1, unit: "l" })])], {
      materials: [item("a", "Paint", { amount: 5, unit: "kg" })],
      tools: noTools,
    });
    expect(r.materials[0]?.status).toEqual({
      kind: "missing",
      missing: { amount: 1, unit: "l" },
    });
    expect(r.materials[0]?.inventoryItemId).toBeNull();
    expect(r.materials[0]?.held).toBeNull();
  });

  it("does not convert area or pieces", () => {
    const r = matchStock([guide([need("Tile", { amount: 1, unit: "m2" })])], {
      materials: [item("a", "Tile", { amount: 100, unit: "piece" })],
      tools: noTools,
    });
    expect(r.materials[0]?.status.kind).toBe("missing");
  });
});

describe("matchStock aggregation", () => {
  it("aggregates the same material across guides and packages", () => {
    const guides = [
      guide([need("Screws", { amount: 6, unit: "piece" }, "n1")]),
      guide([need("screws ", { amount: 6, unit: "piece" }, "n2")]),
    ];
    const r = matchStock(guides, {
      materials: [item("a", "Screws", { amount: 10, unit: "piece" })],
      tools: noTools,
    });
    expect(r.materials).toHaveLength(1);
    expect(r.materials[0]?.need.quantity).toEqual({ amount: 12, unit: "piece" });
    expect(r.materials[0]?.status).toEqual({
      kind: "partly-available",
      missing: { amount: 2, unit: "piece" },
    });
  });

  it("adds quantities of compatible units", () => {
    const guides = [
      guide([need("Pipe", { amount: 1, unit: "m" })]),
      guide([need("Pipe", { amount: 50, unit: "cm" })]),
    ];
    const r = matchStock(guides, { materials: [], tools: noTools });
    expect(r.materials).toHaveLength(1);
    expect(r.materials[0]?.need.quantity).toEqual({ amount: 1.5, unit: "m" });
  });

  it("keeps the same name in incompatible units apart", () => {
    const guides = [
      guide([need("Glue", { amount: 1, unit: "piece" })]),
      guide([need("Glue", { amount: 100, unit: "ml" })]),
    ];
    const r = matchStock(guides, { materials: [], tools: noTools });
    expect(r.materials).toHaveLength(2);
  });
});

describe("matchStock order", () => {
  it("lists available, then partly available, then missing", () => {
    const g = [
      guide([
        need("Missing", { amount: 1, unit: "piece" }),
        need("Partly", { amount: 5, unit: "piece" }),
        need("Own", { amount: 1, unit: "piece" }),
        need("Missing2", { amount: 1, unit: "piece" }),
        need("Own2", { amount: 1, unit: "piece" }),
      ]),
    ];
    const r = matchStock(g, {
      materials: [
        item("1", "Partly", { amount: 1, unit: "piece" }),
        item("2", "Own", { amount: 1, unit: "piece" }),
        item("3", "Own2", { amount: 1, unit: "piece" }),
      ],
      tools: noTools,
    });
    expect(r.materials.map((m) => m.need.name)).toEqual([
      "Own",
      "Own2",
      "Partly",
      "Missing",
      "Missing2",
    ]);
  });
});

describe("matchStock tools", () => {
  it("splits owned and missing tools", () => {
    const r = matchStock([guide([], [tool("Drill"), tool("Saw")])], {
      materials: [],
      tools: [{ id: "t1", name: " drill" }],
    });
    expect(r.ownedTools).toEqual([{ need: tool("Drill"), inventoryToolId: "t1" }]);
    expect(r.missingTools).toEqual([{ need: tool("Saw"), inventoryToolId: null }]);
  });

  it("lists a tool needed by several guides once", () => {
    const r = matchStock([guide([], [tool("Saw")]), guide([], [tool("SAW")])], {
      materials: [],
      tools: noTools,
    });
    expect(r.missingTools).toHaveLength(1);
  });

  it("does not mix tools into materials", () => {
    const r = matchStock([guide([], [tool("Saw")])], {
      materials: [item("a", "Saw", { amount: 1, unit: "piece" })],
      tools: noTools,
    });
    expect(r.materials).toEqual([]);
    expect(r.missingTools).toHaveLength(1);
  });
});

describe("matchStock empty input", () => {
  it("gives empty lists for no guides", () => {
    expect(matchStock([], { materials: [], tools: noTools })).toEqual({
      materials: [],
      ownedTools: [],
      missingTools: [],
    });
  });

  it("marks everything missing for an empty inventory", () => {
    const r = matchStock([guide([need("A", { amount: 2, unit: "piece" })], [tool("Saw")])], {
      materials: [],
      tools: noTools,
    });
    expect(r.materials[0]?.status.kind).toBe("missing");
    expect(r.ownedTools).toEqual([]);
    expect(r.missingTools).toHaveLength(1);
  });
});
