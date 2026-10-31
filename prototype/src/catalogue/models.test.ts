import { beforeEach, describe, expect, it, vi } from "vitest";

const checkLink = vi.fn();
vi.mock("../link-check", () => ({ checkLink: (a: { url: string }) => checkLink(a) }));

import type { MaterialNeed } from "../case-model";
import { findModels, searchModels } from "./models";
import type { ModelEntry } from "./schema";

const model = (over: Partial<ModelEntry> = {}): ModelEntry => ({
  id: "m1",
  title: "Knob",
  spec: { material: "pla" },
  dimensionsMm: { diameter: 30 },
  materialRequirements: "PLA, 0.2 mm layers",
  licence: "CC BY 4.0",
  intendedUse: "Replacement knob",
  url: "https://example.org/m1",
  provider: "Example Models",
  ...over,
});
const need = (over: Partial<MaterialNeed> = {}): MaterialNeed => ({
  id: "n1",
  name: "knob",
  quantity: { amount: 1, unit: "piece" },
  spec: { material: "pla", dimensionsMm: { diameter: 30 } },
  replacementPart: true,
  safetyCritical: "no",
  printable: true,
  ...over,
});

beforeEach(() => {
  checkLink.mockReset();
  checkLink.mockResolvedValue({ reachable: true });
});

describe("findModels", () => {
  it("returns matching, complete, reachable models", async () => {
    expect((await findModels([model()], need())).map((m) => m.id)).toEqual(["m1"]);
  });
  it("excludes models that miss the spec", async () => {
    expect(await findModels([model({ dimensionsMm: { diameter: 60 } })], need())).toEqual([]);
  });
  it("excludes models with incomplete data", async () => {
    expect(await findModels([model({ licence: " " })], need())).toEqual([]);
    expect(await findModels([model({ intendedUse: "" })], need())).toEqual([]);
  });
  it("excludes unreachable links and failed checks, and never rejects", async () => {
    checkLink.mockResolvedValueOnce({ reachable: false });
    expect(await findModels([model()], need())).toEqual([]);
    checkLink.mockRejectedValueOnce(new Error("network"));
    expect(await findModels([model()], need())).toEqual([]);
  });
  it("does not check links of models that already failed the spec", async () => {
    await findModels([model({ dimensionsMm: { diameter: 60 } })], need());
    expect(checkLink).not.toHaveBeenCalled();
  });
});

describe("searchModels (NO-PRINTED-SAFETY-PARTS)", () => {
  it("suggests nothing for a safety-critical, unclear or non-printable part", async () => {
    for (const n of [
      need({ safetyCritical: "yes" }),
      need({ safetyCritical: "unclear" }),
      need({ printable: false }),
    ]) {
      expect(await searchModels(n)).toEqual([]);
    }
    expect(checkLink).not.toHaveBeenCalled();
  });
  it("finds a sample model for a printable, non-critical part", async () => {
    const found = await searchModels(need({ name: "knob", spec: { material: "pla" } }));
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.url).toMatch(/^https:/);
  });
});
