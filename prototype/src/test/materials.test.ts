// Level: unit

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Guide, MaterialNeed, Quantity } from "../case-model";
import { printedPartNote, searchModels, searchOffers, type Offer } from "../catalogue";
import { estimateCosts } from "../cost-estimate";
import type { MaterialItem } from "../inventory";
import { matchStock } from "../stock-matching";

// ITM-252, ARC-005: stock matching, catalogue and cost estimate together over the sample
// catalogue. Only the link check, which would call the network, is replaced. UC-005 to UC-008.
const checkLink = vi.hoisted(() => vi.fn());
vi.mock("../link-check", () => ({ checkLink }));

const piece = (amount: number): Quantity => ({ amount, unit: "piece" });
const need = (over: Partial<MaterialNeed> & Pick<MaterialNeed, "id" | "name">): MaterialNeed => ({
  quantity: piece(1),
  spec: {},
  replacementPart: false,
  safetyCritical: "no",
  printable: false,
  ...over,
});

const washer = need({
  id: "washer",
  name: "Brass washer",
  quantity: piece(4),
  spec: { material: "brass", function: "seal", dimensionsMm: { diameter: 20 } },
});
const sealant = need({
  id: "sealant",
  name: "Silicone sealant",
  quantity: { amount: 100, unit: "ml" },
  spec: { function: "sealant" },
});
const knob = need({
  id: "knob",
  name: "knob",
  spec: { material: "pla", dimensionsMm: { diameter: 30 } },
  replacementPart: true,
  printable: true,
});
const rod = need({ id: "rod", name: "Unobtainium rod", spec: { material: "unobtainium" } });

const guide = (...materials: MaterialNeed[]): Guide => ({
  diagnosis: "Worn parts.",
  tools: [],
  materials,
  steps: [],
  estimatedMinutes: { min: 10, max: 20 },
  warnings: [],
});

const item = (id: string, name: string, quantity: Quantity): MaterialItem => ({
  id,
  name,
  quantity,
});
const stock = (...materials: MaterialItem[]) => ({ materials, tools: [] });
const eur = (amount: number) => ({ amount, currency: "EUR" as const });

beforeEach(() => {
  checkLink.mockReset();
  checkLink.mockResolvedValue({ reachable: true });
});

describe("what the inventory covers (UC-005)", () => {
  it("matches the stock: available, partly available and missing", () => {
    const match = matchStock(
      [guide(washer, sealant, rod)],
      stock(
        item("i1", "Silicone sealant", { amount: 300, unit: "ml" }),
        item("i2", "Brass washer", piece(1)),
      ),
    );
    const status = Object.fromEntries(match.materials.map((m) => [m.need.id, m.status]));
    expect(status["sealant"]).toEqual({ kind: "available" });
    expect(status["washer"]).toEqual({ kind: "partly-available", missing: piece(3) });
    expect(status["rod"]).toEqual({ kind: "missing", missing: piece(1) });
  });

  it("an available item gets no offer, a missing one does (SUGGESTIONS-ONLY-FOR-MISSING)", () => {
    const match = matchStock(
      [guide(washer, sealant)],
      stock(item("i1", "Silicone sealant", { amount: 300, unit: "ml" })),
    );
    for (const m of match.materials) {
      const missing =
        m.status.kind === "available"
          ? { amount: 0, unit: m.need.quantity.unit }
          : m.status.missing;
      const { offers } = searchOffers({ name: m.need.name, spec: m.need.spec }, missing);
      expect(offers.length > 0).toBe(m.status.kind !== "available");
    }
  });
});

describe("the offers for what is missing (UC-006)", () => {
  it("lists second-hand offers first, each with a source, a date and a link to the seller", () => {
    const { offers } = searchOffers({ name: washer.name, spec: washer.spec }, piece(4));
    expect(offers.map((o) => o.condition)).toEqual(["second-hand", "new"]);
    for (const o of offers) {
      expect(o.source.name).toMatch(/\S/);
      expect(o.dataAsOf).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(o.sellerUrl).toMatch(/^https:\/\//);
    }
  });

  it("makes no offer for a part the catalogue does not hold", () => {
    expect(searchOffers({ name: rod.name, spec: rod.spec }, piece(1))).toEqual({
      offers: [],
      noMatch: true,
    });
  });
});

describe("3D models (UC-007)", () => {
  it("suggests a model with its four details for a printable part whose link works", async () => {
    const [model] = await searchModels(knob);
    expect(model).toMatchObject({ id: "model-knob-30" });
    expect(model?.materialRequirements).toMatch(/\S/);
    expect(model?.licence).toMatch(/\S/);
    expect(model?.intendedUse).toMatch(/\S/);
    expect(model?.url).toMatch(/^https:\/\//);
  });

  it("suggests no model when its link does not work", async () => {
    checkLink.mockResolvedValue({ reachable: false });
    expect(await searchModels(knob)).toEqual([]);
  });

  it("suggests no model for a safety-critical part and gives the professional-review note", async () => {
    const critical = { ...knob, safetyCritical: "yes" as const };
    expect(await searchModels(critical)).toEqual([]);
    expect(printedPartNote(critical)).toMatch(/professional review/);
    expect(checkLink).not.toHaveBeenCalled();
  });
});

describe("the cost of each option (UC-008)", () => {
  const options = (budget: ReturnType<typeof eur> | null) => {
    const secondHand = matchStock(
      [guide(washer, sealant)],
      stock(item("i1", "Silicone sealant", { amount: 300, unit: "ml" })),
    );
    const newOffer = searchOffers({ name: washer.name, spec: washer.spec }, piece(4)).offers.find(
      (o): o is Offer => o.condition === "new",
    ) as Offer;
    const buyNew = matchStock([guide(washer, sealant)], stock());
    return estimateCosts(
      [
        { optionId: "second-hand", match: secondHand, chosen: {} },
        { optionId: "new", match: buyNew, chosen: { washer: newOffer } },
        { optionId: "unknown-part", match: matchStock([guide(washer, rod)], stock()), chosen: {} },
      ],
      budget,
    );
  };
  const byId = (r: ReturnType<typeof options>) =>
    Object.fromEntries(r.costs.map((c) => [c.optionId, c]));

  it("counts own stock as free and takes the cheapest offer, second-hand first", () => {
    const c = byId(options(null))["second-hand"]!;
    expect(c.lines.find((l) => l.name === "Silicone sealant")).toMatchObject({
      amount: eur(0),
      fromOwnStock: true,
    });
    expect(c.lines.find((l) => l.name === "Brass washer")?.amount).toEqual(eur(0.15));
    expect(c.total).toEqual(eur(0.15));
  });

  it("marks what is not verified: the fit of a second-hand listing, the price of an AI estimate", () => {
    const c = byId(options(null))["second-hand"]!;
    expect(c.lines.find((l) => l.name === "Brass washer")).toMatchObject({
      fitToCheck: true,
      priceToCheck: false,
    });
  });

  it("counts the packs of a chosen new offer and prices the missing sealant", () => {
    const c = byId(options(null))["new"]!;
    expect(c.lines.find((l) => l.name === "Brass washer")?.amount).toEqual(eur(0.35));
    expect(c.total.amount).toBeGreaterThan(0.35);
  });

  it("marks an option with a part nobody sells as incomplete, with the line left without an amount", () => {
    const c = byId(options(null))["unknown-part"]!;
    expect(c.incomplete).toBe(true);
    expect(c.lines.find((l) => l.name === "Unobtainium rod")?.amount).toBeNull();
  });

  it("every option shows a total, within the budget or marked (BUDGET-RESPECTED)", () => {
    const result = options(eur(1));
    for (const c of result.costs) {
      expect(c.total.amount).toBeGreaterThanOrEqual(0);
      expect(["within", "exceeds"]).toContain(c.budget);
    }
    expect(byId(result)["second-hand"]?.budget).toBe("within");
    expect(byId(result)["new"]?.budget).toBe("exceeds");
    expect(result.noneWithinBudget).toBe(false);
  });

  it("says when no option is within the budget", () => {
    const result = options(eur(0.05));
    expect(result.costs.every((c) => c.budget === "exceeds")).toBe(true);
    expect(result.noneWithinBudget).toBe(true);
  });

  it("sets no budget verdict without a budget", () => {
    expect(options(null).costs.every((c) => c.budget === "no-budget")).toBe(true);
  });
});
