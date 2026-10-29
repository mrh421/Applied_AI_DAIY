import { describe, expect, it } from "vitest";

import type { HazardKind } from "../case-model";
import { detectHazards, escalationFor, precheck } from "./index";

// Inputs of normal, unclear and classification cases: the pre-check must not block them
// (PRECHECK-SPARES-PROJECT-PACKAGES).
const harmless = [
  "Drawer sticks and does not close",
  "I want to build a 12 m wooden fence along the garden boundary.",
  "Air-to-water heat pump, the installer fitted the manufacturer's official LAN gateway with Modbus TCP. I run Home Assistant.",
  "I want to hang a shelf for books on my living room wall. I rent the flat.",
  "My office chair slowly sinks down when I sit on it. I think the gas lift is broken.",
  "In my bathroom I want to replace the faucet, put up a new mirror cabinet with built-in lighting and add a socket next to the mirror.",
  "I want to insulate the accessible attic floor and add a ceiling light up there. I can lay the conduit myself.",
  "I want a wallbox for my electric car in the garage. I'll pull the cable myself to save money.",
  "I want to remove the old wallpaper from the wall in my bedroom.",
  "My black HDMI cable is too short for the TV.",
  "I want to add a new socket in the living room.",
];

const allKinds: HazardKind[] = [
  "gas",
  "carbon-monoxide",
  "fire-or-smoke",
  "overheating-electrics",
  "water-near-electrics",
  "water-leak-in-wall",
  "structural-damage",
  "distribution-board",
  "fixed-installation",
  "grid-connection",
  "gas-installation",
  "refrigerant-circuit",
  "load-bearing-structure",
  "chimney",
  "energy-renovation",
];

describe("detectHazards", () => {
  it.each(harmless)("does not block: %s", (text) => expect(detectHazards(text)).toEqual([]));

  it("returns kinds in catalogue order without duplicates", () => {
    const kinds = detectHazards(
      "The fuse box is smoking, smoke everywhere, and I smell gas. Rauch im Sicherungskasten.",
    );
    expect(kinds).toEqual(["gas", "fire-or-smoke", "distribution-board"]);
  });

  it("returns an empty list for an empty text", () => expect(detectHazards("")).toEqual([]));
});

describe("escalationFor", () => {
  it("is critical when any kind is an emergency", () => {
    expect(escalationFor(["gas"], "precheck").risk).toBe("critical");
    expect(escalationFor(["refrigerant-circuit", "gas"], "precheck").risk).toBe("critical");
  });

  it("is high for out-of-scope work that is no emergency", () => {
    expect(escalationFor(["refrigerant-circuit"], "precheck").risk).toBe("high");
    expect(escalationFor(["distribution-board", "chimney"], "output").risk).toBe("high");
  });

  it("keeps the origin and the kinds", () => {
    const e = escalationFor(["chimney"], "output");
    expect(e.origin).toBe("output");
    expect(e.hazards).toEqual(["chimney"]);
  });

  it("gives carbon monoxide advice, not fuse box advice", () => {
    const e = escalationFor(["carbon-monoxide"], "precheck");
    expect(e.professionals.join(" ")).toMatch(/heating/i);
    expect(e.actions.join(" ")).toMatch(/window|ventilat/i);
    expect(e.actions.join(" ")).toMatch(/112/);
    expect(e.actions.join(" ")).not.toMatch(/fuse|breaker/i);
  });

  it("starts a water leak with the main water valve", () => {
    expect(escalationFor(["water-leak-in-wall"], "precheck").actions[0]).toMatch(
      /main water valve/i,
    );
  });

  it("gives each kind actions and a professional that belong to it only", () => {
    const gas = escalationFor(["gas"], "precheck");
    const refrigerant = escalationFor(["refrigerant-circuit"], "precheck");
    expect(gas.professionals[0]).toMatch(/gas/i);
    expect(refrigerant.professionals[0]).toMatch(/refrigeration|air-conditioning/i);
    for (const a of gas.actions) expect(refrigerant.actions).not.toContain(a);
    for (const a of refrigerant.actions) expect(gas.actions).not.toContain(a);
  });

  it("never presents the fuse box switch-off as securing a circuit", () => {
    for (const k of allKinds) {
      const e = escalationFor([k], "precheck");
      expect(e.actions.join(" ")).not.toMatch(/(switch|turn)\w* off.{0,40}(fuse|breaker)/i);
      expect(e.actions.length).toBeGreaterThan(0);
      expect(e.professionals.length).toBeGreaterThan(0);
    }
  });

  it("lists emergency actions and professionals before the others", () => {
    const e = escalationFor(["distribution-board", "fire-or-smoke"], "precheck");
    expect(e.actions[0]).toMatch(/112|fire brigade/i);
    expect(e.professionals[0]).toMatch(/fire brigade/i);
    expect(e.actions.at(-1)).toMatch(/distribution board/i);
  });

  it("lists no action or professional twice", () => {
    const e = escalationFor(["distribution-board", "fixed-installation"], "precheck");
    expect(new Set(e.actions).size).toBe(e.actions.length);
    expect(new Set(e.professionals).size).toBe(e.professionals.length);
  });

  it("names the kinds and says why no instructions are given", () => {
    const e = escalationFor(["gas-installation", "chimney"], "precheck");
    expect(e.reason).toMatch(/gas/i);
    expect(e.reason).toMatch(/chimney/i);
    expect(e.reason).toMatch(/no instructions/i);
  });

  it("points out the topic and the responsible party for an energy renovation", () => {
    const e = escalationFor(["energy-renovation"], "precheck");
    expect(e.professionals.join(" ")).toMatch(/energy/i);
    expect(e.reason).toMatch(/energy renovation/i);
  });

  it("gives the generic escalation for no kinds", () => {
    const e = escalationFor([], "output");
    expect(e.risk).toBe("high");
    expect(e.hazards).toEqual([]);
    expect(e.actions.join(" ")).toMatch(/stop/i);
    expect(e.professionals.join(" ")).toMatch(/qualified professional/i);
    expect(e.reason).toMatch(/no instructions/i);
    expect(e.origin).toBe("output");
  });
});

describe("precheck", () => {
  it("returns null when no kind is detected", () => {
    expect(precheck(["My drawer is sticking", "It is a kitchen drawer"])).toBeNull();
    expect(precheck([])).toBeNull();
  });

  it("returns the precheck escalation for a hazard in the description", () => {
    const e = precheck(["I smell gas"]);
    expect(e?.risk).toBe("critical");
    expect(e?.origin).toBe("precheck");
    expect(e?.hazards).toEqual(["gas"]);
  });

  it("covers a hazard in a follow-up answer", () => {
    const e = precheck(["My lamp flickers", "Es riecht verbrannt"]);
    expect(e?.hazards).toContain("fire-or-smoke");
  });
});
