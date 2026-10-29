import "fake-indexeddb/auto";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { localStore } from "../local-store";
import {
  deduct,
  listMaterials,
  listTools,
  removeMaterial,
  removeTool,
  saveMaterial,
  saveTool,
  snapshot,
  useInventory,
} from "./index";

beforeEach(async () => {
  await localStore.clearAll();
  localStorage.clear();
});

function mustSave(
  name: string,
  amount: number,
  unit: "piece" | "m" | "g" = "piece",
  location?: string,
) {
  const r = saveMaterial({ name, amount, unit, ...(location === undefined ? {} : { location }) });
  if (!r.ok) throw new Error("save failed");
  return r.item;
}

describe("MOD-inventory materials (MATERIAL-INVENTORY)", () => {
  it("saves a material without a location", () => {
    const r = saveMaterial({ name: "Screws", amount: 20, unit: "piece" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.item).toMatchObject({ name: "Screws", quantity: { amount: 20, unit: "piece" } });
    }
    expect(listMaterials()).toHaveLength(1);
    expect(listMaterials()[0]?.location).toBeUndefined();
  });

  it("saves a material with a location", () => {
    mustSave("Wire", 5, "m", "Basement shelf");
    expect(listMaterials()[0]).toMatchObject({ name: "Wire", location: "Basement shelf" });
  });

  it("names each missing field (ERROR-IDENTIFICATION)", () => {
    const r = saveMaterial({ name: "  ", amount: null, unit: null });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.map((e) => e.field).sort()).toEqual(["amount", "name", "unit"]);
      for (const e of r.errors) expect(e.message.length).toBeGreaterThan(0);
    }
    expect(listMaterials()).toEqual([]);
  });

  it("rejects a negative or non-finite amount and an unknown unit", () => {
    const neg = saveMaterial({ name: "a", amount: -1, unit: "g" });
    expect(neg.ok === false && neg.errors.map((e) => e.field)).toEqual(["amount"]);
    const nan = saveMaterial({ name: "a", amount: Number.NaN, unit: "g" });
    expect(nan.ok).toBe(false);
    const unit = saveMaterial({ name: "a", amount: 1, unit: "bucket" as never });
    expect(unit.ok === false && unit.errors.map((e) => e.field)).toEqual(["unit"]);
  });

  it("accepts an amount of 0", () => {
    expect(saveMaterial({ name: "a", amount: 0, unit: "g" }).ok).toBe(true);
  });

  it("changes a material by id (DATA-RECTIFICATION)", () => {
    const item = mustSave("Screws", 20);
    const r = saveMaterial({ name: "Screws M4", amount: 15, unit: "piece" }, item.id);
    expect(r.ok && r.item.id).toBe(item.id);
    expect(listMaterials()).toHaveLength(1);
    expect(listMaterials()[0]).toMatchObject({ name: "Screws M4", quantity: { amount: 15 } });
  });

  it("removes a material", () => {
    const item = mustSave("Screws", 20);
    removeMaterial(item.id);
    expect(listMaterials()).toEqual([]);
  });

  it("persists across reload (INVENTORY-ON-DEVICE)", () => {
    mustSave("Screws", 20);
    expect(localStorage.getItem("daiy.v1.materials")).not.toBeNull();
    expect(listMaterials()[0]?.name).toBe("Screws");
  });
});

describe("MOD-inventory tools (TOOL-INVENTORY)", () => {
  it("saves, changes and removes a tool", () => {
    const r = saveTool("Hammer");
    if (!r.ok) throw new Error("save failed");
    expect(listTools()).toEqual([{ id: r.item.id, name: "Hammer" }]);
    saveTool("Claw hammer", r.item.id);
    expect(listTools()).toEqual([{ id: r.item.id, name: "Claw hammer" }]);
    removeTool(r.item.id);
    expect(listTools()).toEqual([]);
  });

  it("names the field when the tool name is empty", () => {
    const r = saveTool(" ");
    expect(r.ok === false && r.errors.map((e) => e.field)).toEqual(["name"]);
  });
});

describe("MOD-inventory deduct (DEDUCT-CONSUMED)", () => {
  it("lowers the held quantity and returns the changed items", () => {
    const a = mustSave("Screws", 20);
    const b = mustSave("Wire", 5, "m");
    const changed = deduct([{ itemId: a.id, amount: 8 }]);
    expect(changed).toHaveLength(1);
    expect(changed[0]).toMatchObject({ id: a.id, quantity: { amount: 12, unit: "piece" } });
    expect(listMaterials().find((m) => m.id === b.id)?.quantity.amount).toBe(5);
  });

  it("clamps to 0 when more than held is used", () => {
    const a = mustSave("Screws", 3);
    expect(deduct([{ itemId: a.id, amount: 10 }])[0]?.quantity.amount).toBe(0);
    expect(listMaterials()[0]?.quantity.amount).toBe(0);
  });

  it("ignores unknown ids", () => {
    mustSave("Screws", 3);
    expect(deduct([{ itemId: "nope", amount: 1 }])).toEqual([]);
  });
});

describe("MOD-inventory snapshot (INPUT-USES-INVENTORY)", () => {
  it("carries names and quantities, and tool names", () => {
    mustSave("Screws", 20, "piece", "box");
    saveTool("Hammer");
    expect(snapshot()).toEqual({
      materials: [{ name: "Screws", quantity: { amount: 20, unit: "piece" } }],
      tools: [{ name: "Hammer" }],
    });
  });

  it("is empty for an empty inventory", () => {
    expect(snapshot()).toEqual({ materials: [], tools: [] });
  });
});

describe("MOD-inventory useInventory", () => {
  it("follows changes", () => {
    const { result } = renderHook(() => useInventory());
    expect(result.current).toEqual({ materials: [], tools: [] });
    act(() => {
      mustSave("Screws", 20);
      saveTool("Hammer");
    });
    expect(result.current.materials).toHaveLength(1);
    expect(result.current.tools).toHaveLength(1);
  });
});
