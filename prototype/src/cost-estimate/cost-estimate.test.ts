import { describe, expect, it, vi } from "vitest";

import type { MaterialNeed, Quantity } from "../case-model";
import type { Datum, Offer } from "../catalogue";
import type { MaterialMatch, StockMatch } from "../stock-matching";
import { estimateCosts } from "./index";

// The catalogue is replaced by a double that serves the interface of MOD-catalogue.
const searched = vi.hoisted(() => ({ calls: [] as unknown[][], cheapest: undefined as unknown }));
vi.mock("../catalogue", () => ({
  searchOffers: (item: unknown, missing: unknown) => {
    searched.calls.push([item, missing]);
    return searched.cheapest === undefined
      ? { offers: [], noMatch: true }
      : { offers: [searched.cheapest], noMatch: false };
  },
}));

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const verified = <T>(value: T): Datum<T> => ({ certainty: "verified", value, source: "test" });

function offer(
  id: string,
  price: Datum<{ amount: number; currency: "EUR" }>,
  pack = 1,
  fits = true,
): Offer {
  return {
    id,
    title: id,
    condition: "new",
    unitPrice: price,
    packSize: { amount: pack, unit: "piece" },
    spec: {
      dimensionsMm: verified({}),
      material: verified("steel"),
      function: verified("screw"),
    },
    compatibility: fits ? verified("fits") : { certainty: "unverified", value: null },
    availability: verified("in-stock"),
    dataAsOf: "2026-10-01",
    source: { name: "s", url: "https://example.com" },
    sellerUrl: "https://example.com/buy",
    sustainabilityReason: null,
  };
}

function need(id: string, quantity: Quantity): MaterialNeed {
  return {
    id,
    name: id,
    quantity,
    spec: {},
    replacementPart: false,
    safetyCritical: "no",
    printable: false,
  };
}
function line(
  n: MaterialNeed,
  kind: "available" | "partly-available" | "missing",
  missing = 0,
): MaterialMatch {
  const status =
    kind === "available"
      ? ({ kind } as const)
      : ({ kind, missing: { amount: missing, unit: n.quantity.unit } } as const);
  return { need: n, inventoryItemId: null, held: null, status };
}
const match = (...materials: MaterialMatch[]): StockMatch => ({
  materials,
  ownedTools: [],
  missingTools: [],
});
const piece = (amount: number): Quantity => ({ amount, unit: "piece" });

describe("estimateCosts", () => {
  it("totals the item prices", () => {
    const a = need("a", piece(2));
    const b = need("b", piece(1));
    const { costs } = estimateCosts(
      [
        {
          optionId: "o1",
          match: match(line(a, "missing", 2), line(b, "missing", 1)),
          chosen: { a: offer("oa", verified(eur(1.5))), b: offer("ob", verified(eur(4))) },
        },
      ],
      null,
    );
    expect(costs[0]!.total).toEqual(eur(7));
    expect(costs[0]!.incomplete).toBe(false);
    expect(costs[0]!.lines.map((l) => l.amount)).toEqual([eur(3), eur(4)]);
    expect(costs[0]!.budget).toBe("no-budget");
  });

  it("charges nothing for own stock", () => {
    const a = need("a", piece(2));
    const { costs } = estimateCosts(
      [{ optionId: "o", match: match(line(a, "available")), chosen: {} }],
      null,
    );
    expect(costs[0]!.lines[0]).toMatchObject({
      amount: eur(0),
      fromOwnStock: true,
      priceToCheck: false,
      fitToCheck: false,
    });
    expect(costs[0]!.total).toEqual(eur(0));
  });

  it("rounds the missing quantity up to whole packs, for partly available too", () => {
    const a = need("a", piece(10));
    const { costs } = estimateCosts(
      [
        {
          optionId: "o",
          match: match(line(a, "partly-available", 7)),
          chosen: { a: offer("oa", verified(eur(2)), 5) },
        },
      ],
      null,
    );
    expect(costs[0]!.lines[0]!.amount).toEqual(eur(4));
    expect(costs[0]!.lines[0]!.fromOwnStock).toBe(false);
  });

  it("defaults to the cheapest offer from searchOffers", () => {
    const a = need("screw", piece(3));
    searched.cheapest = offer("cheapest", verified(eur(0.5)));
    const { costs } = estimateCosts(
      [{ optionId: "o", match: match(line(a, "missing", 3)), chosen: {} }],
      null,
    );
    expect(costs[0]!.lines[0]!.amount).toEqual(eur(1.5));
    expect(searched.calls.at(-1)).toEqual([{ name: "screw", spec: {} }, piece(3)]);
    searched.cheapest = undefined;
  });

  it("gives a line no amount when the catalogue has no offer", () => {
    const a = need("rare", piece(1));
    const { costs } = estimateCosts(
      [{ optionId: "o", match: match(line(a, "missing", 1)), chosen: {} }],
      null,
    );
    expect(costs[0]!.lines[0]!.amount).toBeNull();
    expect(costs[0]!.incomplete).toBe(true);
  });

  it("gives a line without an offer a null amount and an incomplete total", () => {
    const a = need("a", piece(1));
    const b = need("b", piece(1));
    const { costs } = estimateCosts(
      [
        {
          optionId: "o",
          match: match(line(a, "missing", 1), line(b, "missing", 1)),
          chosen: { a: null, b: offer("ob", verified(eur(5))) },
        },
      ],
      null,
    );
    expect(costs[0]!.lines[0]!.amount).toBeNull();
    expect(costs[0]!.incomplete).toBe(true);
    expect(costs[0]!.total).toEqual(eur(5));
  });

  it("treats an unknown price value as no amount", () => {
    const a = need("a", piece(1));
    const { costs } = estimateCosts(
      [
        {
          optionId: "o",
          match: match(line(a, "missing", 1)),
          chosen: { a: offer("oa", { certainty: "unverified", value: null }) },
        },
      ],
      null,
    );
    expect(costs[0]!.lines[0]!.amount).toBeNull();
    expect(costs[0]!.incomplete).toBe(true);
  });

  it("marks unverified prices and fits", () => {
    const a = need("a", piece(1));
    const b = need("b", piece(1));
    const { costs } = estimateCosts(
      [
        {
          optionId: "o",
          match: match(line(a, "missing", 1), line(b, "missing", 1)),
          chosen: {
            a: offer("oa", { certainty: "ai-estimate", value: eur(2) }),
            b: offer("ob", verified(eur(2)), 1, false),
          },
        },
      ],
      null,
    );
    expect(costs[0]!.lines[0]).toMatchObject({
      amount: eur(2),
      priceToCheck: true,
      fitToCheck: false,
    });
    expect(costs[0]!.lines[1]).toMatchObject({ priceToCheck: false, fitToCheck: true });
  });

  it("compares with a budget and flags when none is within", () => {
    const a = need("a", piece(1));
    const opt = (id: string, price: number) => ({
      optionId: id,
      match: match(line(a, "missing", 1)),
      chosen: { a: offer(id, verified(eur(price))) },
    });
    const r = estimateCosts([opt("cheap", 10), opt("dear", 30)], eur(10));
    expect(r.costs.map((c) => c.budget)).toEqual(["within", "exceeds"]);
    expect(r.noneWithinBudget).toBe(false);
    const r2 = estimateCosts([opt("dear", 30)], eur(10));
    expect(r2.costs[0]!.budget).toBe("exceeds");
    expect(r2.noneWithinBudget).toBe(true);
  });

  it("sets noneWithinBudget only when a budget is given", () => {
    expect(estimateCosts([], null)).toEqual({ costs: [], noneWithinBudget: false });
    const r = estimateCosts([{ optionId: "o", match: match(), chosen: {} }], null);
    expect(r.noneWithinBudget).toBe(false);
  });
});
