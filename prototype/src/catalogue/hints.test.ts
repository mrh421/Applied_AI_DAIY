import { describe, expect, it } from "vitest";

import type { MaterialNeed } from "../case-model";
import { printedPartNote, toolHint } from "./hints";

const part = (over: Partial<MaterialNeed>): MaterialNeed => ({
  id: "n",
  name: "bracket",
  quantity: { amount: 1, unit: "piece" },
  spec: {},
  replacementPart: true,
  safetyCritical: "no",
  printable: true,
  ...over,
});

describe("toolHint (RENT-OR-BORROW-HINT)", () => {
  it("hints at renting or borrowing a rentable tool", () => {
    const h = toolHint({ id: "t", name: "tile cutter", rentable: true });
    expect(h).toMatch(/rent/i);
    expect(h).toMatch(/borrow/i);
    expect(h).toContain("tile cutter");
  });
  it("gives no hint otherwise", () => {
    expect(toolHint({ id: "t", name: "hammer", rentable: false })).toBeNull();
  });
});

describe("printedPartNote (NO-PRINTED-SAFETY-PARTS)", () => {
  it("asks for professional review of a printable safety-critical part", () => {
    expect(printedPartNote(part({ safetyCritical: "yes" }))).toMatch(/professional review/i);
  });
  it("gives no note otherwise", () => {
    expect(printedPartNote(part({ safetyCritical: "no" }))).toBeNull();
    expect(printedPartNote(part({ safetyCritical: "yes", printable: false }))).toBeNull();
  });
});
