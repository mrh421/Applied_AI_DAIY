import { describe, expect, it } from "vitest";

import type { NoticeKind } from "../case-model";
import { CATALOGUE } from "./catalogue";
import { noticesFor } from "./index";

const KINDS = Object.keys(CATALOGUE) as NoticeKind[];

describe("noticesFor", () => {
  it("returns an empty list for an empty input", () => {
    expect(noticesFor([])).toEqual([]);
  });

  it("covers all ten kinds in the catalogue", () => {
    expect(KINDS).toHaveLength(10);
  });

  it.each(KINDS)("yields the applies text and marks of %s", (kind) => {
    const n = noticesFor([{ kind, certainty: "applies" }])[0]!;
    expect(n).toEqual({
      kind,
      certainty: "applies",
      text: CATALOGUE[kind].applies,
      marks: CATALOGUE[kind].marks,
    });
    expect(n.text.length).toBeGreaterThan(0);
  });

  it.each(KINDS)("uses the possibility wording for %s when possible", (kind) => {
    const n = noticesFor([{ kind, certainty: "possible" }])[0]!;
    expect(n.certainty).toBe("possible");
    expect(n.text).toBe(CATALOGUE[kind].possible);
    expect(n.text).not.toBe(CATALOGUE[kind].applies);
  });

  it("marks location-dependent rules and planting with check-locally", () => {
    for (const kind of ["location-dependent-rule", "planting-near-boundary"] as const) {
      expect(noticesFor([{ kind, certainty: "applies" }])[0]!.marks).toEqual(["check-locally"]);
    }
  });

  it("marks warranty-or-funding for the manufacturer or funding body", () => {
    expect(noticesFor([{ kind: "warranty-or-funding", certainty: "applies" }])[0]!.marks).toEqual([
      "check-with-manufacturer-or-funding-body",
    ]);
  });

  it("gives no marks to the other kinds", () => {
    const marked = ["location-dependent-rule", "planting-near-boundary", "warranty-or-funding"];
    for (const kind of KINDS.filter((k) => !marked.includes(k))) {
      expect(CATALOGUE[kind].marks).toEqual([]);
    }
  });

  it("merges duplicates of one kind", () => {
    const out = noticesFor([
      { kind: "rented-property", certainty: "applies" },
      { kind: "rented-property", certainty: "applies" },
    ]);
    expect(out).toHaveLength(1);
  });

  it("gives applies when a kind is found with both certainties", () => {
    for (const order of [
      ["possible", "applies"],
      ["applies", "possible"],
    ] as const) {
      const out = noticesFor(
        order.map((certainty) => ({ kind: "permit-free" as const, certainty })),
      );
      expect(out).toHaveLength(1);
      expect(out[0]!.certainty).toBe("applies");
      expect(out[0]!.text).toBe(CATALOGUE["permit-free"].applies);
    }
  });

  it("keeps several kinds separate, in catalogue order", () => {
    const out = noticesFor([
      { kind: "warranty-or-funding", certainty: "possible" },
      { kind: "location-dependent-rule", certainty: "applies" },
      { kind: "rented-property", certainty: "applies" },
    ]);
    expect(out.map((n) => n.kind)).toEqual([
      "location-dependent-rule",
      "rented-property",
      "warranty-or-funding",
    ]);
  });

  it("never states that a permit-free project is free of rules", () => {
    const texts = KINDS.flatMap((k) => [CATALOGUE[k].applies, CATALOGUE[k].possible]);
    for (const t of texts) {
      expect(t).not.toMatch(/(?<!not mean )no (other )?(rules|requirements)\b/i);
      expect(t).not.toMatch(/free of (rules|requirements)/i);
    }
    const permit = CATALOGUE["permit-free"];
    for (const t of [permit.applies, permit.possible]) {
      expect(t).toMatch(/other requirements|other rules/i);
      expect(t).toMatch(/neighbour/i);
      expect(t).toMatch(/fire protection/i);
    }
  });

  it("names the chimney sweep for the three heating kinds", () => {
    for (const kind of [
      "heating-or-flue-change",
      "heating-or-flue-decommission",
      "firing-installation",
    ] as const) {
      expect(CATALOGUE[kind].applies).toMatch(/chimney sweep/i);
    }
  });
});
