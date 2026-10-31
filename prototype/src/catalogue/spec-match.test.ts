import { describe, expect, it } from "vitest";

import { dimensionsMatch, matchesRequirements } from "./spec-match";

describe("dimensionsMatch (PRODUCT-MATCHING-BY-SPEC)", () => {
  it("accepts ±2 percent for values of 50 mm and more", () => {
    expect(dimensionsMatch({ length: 100 }, { length: 101.9 })).toBe(true);
    expect(dimensionsMatch({ length: 100 }, { length: 98 })).toBe(true);
    expect(dimensionsMatch({ length: 100 }, { length: 102.5 })).toBe(false);
  });
  it("accepts ±1 mm for values under 50 mm", () => {
    expect(dimensionsMatch({ diameter: 20 }, { diameter: 21 })).toBe(true);
    expect(dimensionsMatch({ diameter: 20 }, { diameter: 19 })).toBe(true);
    expect(dimensionsMatch({ diameter: 20 }, { diameter: 21.5 })).toBe(false);
  });
  it("fails a stated dimension the candidate lacks, and ignores unstated ones", () => {
    expect(dimensionsMatch({ length: 100, width: 10 }, { length: 100 })).toBe(false);
    expect(dimensionsMatch({ length: 100 }, { length: 100, width: 10 })).toBe(true);
  });
});

describe("matchesRequirements", () => {
  const cand = {
    title: "Brass washer",
    dimensionsMm: { diameter: 20 },
    material: "Brass",
    function: "seal",
  };
  it("meets every stated requirement", () => {
    expect(matchesRequirements("washer", { material: "brass", function: "Seal" }, cand)).toBe(true);
  });
  it("fails when one stated requirement differs", () => {
    expect(matchesRequirements("washer", { material: "steel" }, cand)).toBe(false);
    expect(matchesRequirements("washer", { dimensionsMm: { diameter: 30 } }, cand)).toBe(false);
  });
  it("treats a missing candidate value as not meeting the requirement", () => {
    expect(
      matchesRequirements("washer", { material: "brass" }, { ...cand, material: undefined }),
    ).toBe(false);
  });
  it("matches by name when the spec states nothing", () => {
    expect(matchesRequirements("washer", {}, cand)).toBe(true);
    expect(matchesRequirements("hinge", undefined, cand)).toBe(false);
  });
});
