import { describe, expect, it } from "vitest";
import { z } from "zod";

import listings from "../../data/catalogue/listings.json";
import models from "../../data/catalogue/models.json";
import products from "../../data/catalogue/products.json";
import { datumSchema, modelEntrySchema, offerSchema } from "./schema";

const offerFiles = [
  ["products", products, "new"],
  ["listings", listings, "second-hand"],
] as const;

describe.each(offerFiles)("%s.json", (_name, data, condition) => {
  const parsed = z.array(offerSchema).safeParse(data);
  const entries = parsed.success ? parsed.data : [];
  it("matches the Offer schema and is not empty", () => {
    expect(parsed.success, parsed.success ? "" : parsed.error.message).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });
  it(`holds only ${condition} offers with a source, seller link and date`, () => {
    for (const o of entries) {
      expect(o.condition).toBe(condition);
      expect(o.sellerUrl).toMatch(/^https:\/\//);
      expect(o.source.url).toMatch(/^https:\/\//);
      expect(o.dataAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("gives sustainability reasons without CO₂ figures", () => {
    for (const o of entries) expect(o.sustainabilityReason ?? "").not.toMatch(/CO₂|CO2/i);
  });
});

it("has unique ids across the catalogue", () => {
  const ids = [...products, ...listings, ...models].map((e) => e.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it("matches the ModelEntry schema", () => {
  const r = z.array(modelEntrySchema).safeParse(models);
  expect(r.success, r.success ? "" : r.error.message).toBe(true);
  expect(models.length).toBeGreaterThan(0);
});

it("requires a source for every verified datum (VERIFIED-DATA-SOURCE)", () => {
  const s = datumSchema(z.string());
  expect(s.safeParse({ certainty: "verified", value: "x" }).success).toBe(false);
  expect(s.safeParse({ certainty: "verified", value: "x", source: "" }).success).toBe(false);
  expect(s.safeParse({ certainty: "verified", value: "x", source: "s" }).success).toBe(true);
  expect(s.safeParse({ certainty: "unverified", value: null }).success).toBe(true);
  expect(s.safeParse({ certainty: "ai-estimate", value: "x" }).success).toBe(true);
});

it("leaves second-hand listings without evidence unverified, with value null", () => {
  const r = z.array(offerSchema).parse(listings);
  const noEvidence = r.filter((o) => o.compatibility.certainty === "unverified");
  expect(noEvidence.length).toBeGreaterThan(0);
  for (const o of noEvidence) expect(o.compatibility.value).toBeNull();
});
