import { describe, expect, it } from "vitest";

import { offer } from "./fixtures";
import { rankOffers, searchOffers } from "./offers";
import type { Offer } from "./schema";

const unverified = { certainty: "unverified", value: null } as const;
const item = { name: "washer", spec: { material: "brass", dimensionsMm: { diameter: 20 } } };
const missing = { amount: 2, unit: "piece" } as const;
const price = (amount: number) =>
  ({
    certainty: "verified",
    value: { amount, currency: "EUR" },
    source: "t",
  }) as Offer["unitPrice"];

describe("rankOffers", () => {
  it("includes matches and excludes misses", () => {
    const hit = offer({ id: "hit", title: "Brass washer" });
    const wrongSize = offer({
      id: "size",
      spec: {
        ...hit.spec,
        dimensionsMm: { certainty: "verified", value: { diameter: 30 }, source: "t" },
      },
    });
    const wrongMaterial = offer({
      id: "mat",
      spec: { ...hit.spec, material: { certainty: "verified", value: "steel", source: "t" } },
    });
    const r = rankOffers([hit, wrongSize, wrongMaterial], item, missing);
    expect(r.offers.map((o) => o.id)).toEqual(["hit"]);
    expect(r.noMatch).toBe(false);
  });

  it("treats an unverified value as not meeting a stated requirement", () => {
    const o = offer({ id: "u", title: "Brass washer" });
    const bad = { ...o, spec: { ...o.spec, material: unverified } } as Offer;
    expect(rankOffers([bad], item, missing)).toEqual({ offers: [], noMatch: true });
  });

  it("lists all second-hand offers before new ones, cheapest first in each group", () => {
    const list = [
      offer({ id: "new-cheap", unitPrice: price(1) }),
      offer({ id: "sh-dear", condition: "second-hand", unitPrice: price(9) }),
      offer({ id: "new-dear", unitPrice: price(8) }),
      offer({ id: "sh-cheap", condition: "second-hand", unitPrice: price(3) }),
    ];
    expect(rankOffers(list, item, missing).offers.map((o) => o.id)).toEqual([
      "sh-cheap",
      "sh-dear",
      "new-cheap",
      "new-dear",
    ]);
  });

  it("puts an offer with an unknown price last in its group", () => {
    const list = [
      offer({ id: "unknown", unitPrice: unverified }),
      offer({ id: "known", unitPrice: price(4) }),
    ];
    expect(rankOffers(list, item, missing).offers.map((o) => o.id)).toEqual(["known", "unknown"]);
  });

  it("excludes offers in a unit that cannot cover the missing quantity", () => {
    const o = offer({ id: "m", packSize: { amount: 1, unit: "m" } });
    expect(rankOffers([o], item, missing).noMatch).toBe(true);
  });

  it("gives no offers and no noMatch when nothing is missing (SUGGESTIONS-ONLY-FOR-MISSING)", () => {
    expect(rankOffers([offer({ id: "a" })], item, { amount: 0, unit: "piece" })).toEqual({
      offers: [],
      noMatch: false,
    });
  });
});

describe("searchOffers on the sample catalogue", () => {
  it("finds second-hand offers first for a known part", () => {
    const r = searchOffers({ name: "washer", spec: { material: "brass" } }, missing);
    expect(r.noMatch).toBe(false);
    const conditions = r.offers.map((o) => o.condition);
    expect(conditions).toContain("second-hand");
    expect(conditions).toContain("new");
    expect(conditions.lastIndexOf("second-hand")).toBeLessThan(conditions.indexOf("new"));
  });
  it("reports noMatch for an unknown part", () => {
    expect(searchOffers({ name: "flux capacitor" }, missing)).toEqual({
      offers: [],
      noMatch: true,
    });
  });
});
