import { describe, expect, it } from "vitest";

import { LABEL_STRICTNESS, rankOptions, stricterLabel } from "./index";
import type { OptionKind, PackageLabel, SolutionOption } from "./index";

describe("stricterLabel", () => {
  it("lists the labels from least to most restrictive", () => {
    expect(LABEL_STRICTNESS).toEqual([
      "diy",
      "diy-preparation",
      "professional-only",
      "not-recommended",
    ]);
  });

  it("returns the more restrictive label for every pair, in both orders", () => {
    LABEL_STRICTNESS.forEach((a, i) => {
      LABEL_STRICTNESS.forEach((b, j) => {
        const expected = LABEL_STRICTNESS[Math.max(i, j)] as PackageLabel;
        expect(stricterLabel(a, b)).toBe(expected);
      });
    });
  });
});

function option(id: string, kind: OptionKind): SolutionOption {
  return { id, kind, title: id, packages: [] };
}

describe("rankOptions", () => {
  it("puts repair and reuse ahead of buy-new", () => {
    const ranked = rankOptions([
      option("n1", "buy-new"),
      option("u1", "reuse"),
      option("r1", "repair"),
    ]);
    expect(ranked.map((o) => o.id)).toEqual(["r1", "u1", "n1"]);
  });

  it("keeps the given order within a kind", () => {
    const ranked = rankOptions([
      option("n1", "buy-new"),
      option("r1", "repair"),
      option("u1", "reuse"),
      option("r2", "repair"),
      option("n2", "buy-new"),
      option("u2", "reuse"),
    ]);
    expect(ranked.map((o) => o.id)).toEqual(["r1", "r2", "u1", "u2", "n1", "n2"]);
  });

  it("does not change its input", () => {
    const input = [option("n1", "buy-new"), option("r1", "repair")];
    rankOptions(input);
    expect(input.map((o) => o.id)).toEqual(["n1", "r1"]);
  });

  it("accepts an empty list", () => {
    expect(rankOptions([])).toEqual([]);
  });
});
