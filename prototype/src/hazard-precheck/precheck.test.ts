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
  // TST-001 · level: unit · module: MOD-hazard-precheck
  // guards: PRECHECK-SPARES-PROJECT-PACKAGES
  // given: an ordinary description of a repair or a project, such as a sticking drawer or a new socket next to a mirror
  // input: the text
  // expect: no hazard kind is detected, so the pre-check does not block the case
  it.each(harmless)("does not block: %s", (text) => expect(detectHazards(text)).toEqual([]));

  // TST-002 · level: unit · module: MOD-hazard-precheck
  // guards: PRECHECK-ENGLISH; PRECHECK-GERMAN
  // given: a text in English and German that names smoke, gas and a fuse box twice
  // input: the text
  // expect: the kinds gas, fire-or-smoke and distribution-board, in catalogue order, each once
  it("returns kinds in catalogue order without duplicates", () => {
    const kinds = detectHazards(
      "The fuse box is smoking, smoke everywhere, and I smell gas. Rauch im Sicherungskasten.",
    );
    expect(kinds).toEqual(["gas", "fire-or-smoke", "distribution-board"]);
  });

  // TST-003 · level: unit · module: MOD-hazard-precheck
  // guards: PRECHECK-ENGLISH
  // given: an empty text
  // input: the text
  // expect: no hazard kind
  it("returns an empty list for an empty text", () => expect(detectHazards("")).toEqual([]));
});

describe("escalationFor", () => {
  // TST-004 · level: unit · module: MOD-hazard-precheck
  // guards: EMERGENCY-RISK-CRITICAL
  // given: a hazard kind that is an emergency, alone or with others
  // input: the kinds
  // expect: the escalation has the risk critical
  it("is critical when any kind is an emergency", () => {
    expect(escalationFor(["gas"], "precheck").risk).toBe("critical");
    expect(escalationFor(["refrigerant-circuit", "gas"], "precheck").risk).toBe("critical");
  });

  // TST-005 · level: unit · module: MOD-hazard-precheck
  // guards: EMERGENCY-RISK-CRITICAL; OUT-OF-SCOPE-ESCALATION; OUT-OF-SCOPE-RISK-HIGH
  // given: kinds of work outside the app's scope that are no emergency
  // input: the kinds
  // expect: the escalation has the risk high
  it("is high for out-of-scope work that is no emergency", () => {
    expect(escalationFor(["refrigerant-circuit"], "precheck").risk).toBe("high");
    expect(escalationFor(["distribution-board", "chimney"], "output").risk).toBe("high");
  });

  // TST-006 · level: unit · module: MOD-hazard-precheck
  // guards: ESCALATION-REASON
  // given: an escalation built from the kind chimney for the origin output
  // input: the kind and the origin
  // expect: the escalation names the origin and lists the kind
  it("keeps the origin and the kinds", () => {
    const e = escalationFor(["chimney"], "output");
    expect(e.origin).toBe("output");
    expect(e.hazards).toEqual(["chimney"]);
  });

  // TST-007 · level: unit · module: MOD-hazard-precheck
  // guards: HAZARD-SAFETY-MEASURES
  // given: the kind carbon-monoxide
  // input: the kind
  // expect: the actions name windows and the emergency number, the professional is a heating specialist, and no action speaks of a fuse or breaker
  it("gives carbon monoxide advice, not fuse box advice", () => {
    const e = escalationFor(["carbon-monoxide"], "precheck");
    expect(e.professionals.join(" ")).toMatch(/heating/i);
    expect(e.actions.join(" ")).toMatch(/window|ventilat/i);
    expect(e.actions.join(" ")).toMatch(/112/);
    expect(e.actions.join(" ")).not.toMatch(/fuse|breaker/i);
  });

  // TST-008 · level: unit · module: MOD-hazard-precheck
  // guards: HAZARD-SAFETY-MEASURES
  // given: the kind water-leak-in-wall
  // input: the kind
  // expect: the first action is to close the main water valve
  it("starts a water leak with the main water valve", () => {
    expect(escalationFor(["water-leak-in-wall"], "precheck").actions[0]).toMatch(
      /main water valve/i,
    );
  });

  // TST-009 · level: unit · module: MOD-hazard-precheck
  // guards: HAZARD-SAFETY-MEASURES; HAZARD-PROFESSIONAL
  // given: the escalations for gas and for the refrigerant circuit
  // input: the two kinds
  // expect: each names its own professional and shares no action with the other
  it("gives each kind actions and a professional that belong to it only", () => {
    const gas = escalationFor(["gas"], "precheck");
    const refrigerant = escalationFor(["refrigerant-circuit"], "precheck");
    expect(gas.professionals[0]).toMatch(/gas/i);
    expect(refrigerant.professionals[0]).toMatch(/refrigeration|air-conditioning/i);
    for (const a of gas.actions) expect(refrigerant.actions).not.toContain(a);
    for (const a of refrigerant.actions) expect(gas.actions).not.toContain(a);
  });

  // TST-010 · level: unit · module: MOD-hazard-precheck
  // guards: HAZARD-SAFETY-MEASURES
  // given: every hazard kind of the catalogue, one at a time
  // input: the kind
  // expect: no action tells the person to switch off at the fuse or breaker, and every escalation has at least one action and one professional
  it("never presents the fuse box switch-off as securing a circuit", () => {
    for (const k of allKinds) {
      const e = escalationFor([k], "precheck");
      expect(e.actions.join(" ")).not.toMatch(/(switch|turn)\w* off.{0,40}(fuse|breaker)/i);
      expect(e.actions.length).toBeGreaterThan(0);
      expect(e.professionals.length).toBeGreaterThan(0);
    }
  });

  // TST-011 · level: unit · module: MOD-hazard-precheck
  // guards: HAZARD-SAFETY-MEASURES; EMERGENCY-ACTIONS-FIRST
  // given: the kinds distribution-board and fire-or-smoke together
  // input: the kinds
  // expect: the first action is the emergency call, the first professional is the fire brigade and the distribution board advice comes last
  it("lists emergency actions and professionals before the others", () => {
    const e = escalationFor(["distribution-board", "fire-or-smoke"], "precheck");
    expect(e.actions[0]).toMatch(/112|fire brigade/i);
    expect(e.professionals[0]).toMatch(/fire brigade/i);
    expect(e.actions.at(-1)).toMatch(/distribution board/i);
  });

  // TST-012 · level: unit · module: MOD-hazard-precheck
  // guards: ESCALATION-REASON
  // given: two kinds that share advice
  // input: the kinds
  // expect: every action and every professional appears once
  it("lists no action or professional twice", () => {
    const e = escalationFor(["distribution-board", "fixed-installation"], "precheck");
    expect(new Set(e.actions).size).toBe(e.actions.length);
    expect(new Set(e.professionals).size).toBe(e.professionals.length);
  });

  // TST-013 · level: unit · module: MOD-hazard-precheck
  // guards: ESCALATION-REASON; NO-GUIDE-FOR-HAZARDS
  // given: the kinds gas-installation and chimney
  // input: the kinds
  // expect: the reason names both kinds and states that no instructions are given
  it("names the kinds and says why no instructions are given", () => {
    const e = escalationFor(["gas-installation", "chimney"], "precheck");
    expect(e.reason).toMatch(/gas/i);
    expect(e.reason).toMatch(/chimney/i);
    expect(e.reason).toMatch(/no instructions/i);
  });

  // TST-014 · level: unit · module: MOD-hazard-precheck
  // guards: HAZARD-PROFESSIONAL; OUT-OF-SCOPE-ESCALATION; NO-ENERGY-RENOVATION-PLANNING
  // given: the kind energy-renovation
  // input: the kind
  // expect: the professional is an energy specialist and the reason names the energy renovation
  it("points out the topic and the responsible party for an energy renovation", () => {
    const e = escalationFor(["energy-renovation"], "precheck");
    expect(e.professionals.join(" ")).toMatch(/energy/i);
    expect(e.reason).toMatch(/energy renovation/i);
  });

  // TST-015 · level: unit · module: MOD-hazard-precheck
  // guards: ESCALATION-REASON
  // given: an output escalation with no kind
  // input: an empty list of kinds
  // expect: risk high, no kind, the advice to stop, a qualified professional and the statement that no instructions are given
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
  // TST-016 · level: unit · module: MOD-hazard-precheck
  // guards: PRECHECK-SPARES-PROJECT-PACKAGES
  // given: descriptions of a sticking drawer, and no texts at all
  // input: the texts
  // expect: the pre-check returns null
  it("returns null when no kind is detected", () => {
    expect(precheck(["My drawer is sticking", "It is a kitchen drawer"])).toBeNull();
    expect(precheck([])).toBeNull();
  });

  // TST-017 · level: unit · module: MOD-hazard-precheck
  // guards: NO-GUIDE-FOR-HAZARDS
  // given: the description 'I smell gas'
  // input: the text
  // expect: an escalation of risk critical from the pre-check with the kind gas
  it("returns the precheck escalation for a hazard in the description", () => {
    const e = precheck(["I smell gas"]);
    expect(e?.risk).toBe("critical");
    expect(e?.origin).toBe("precheck");
    expect(e?.hazards).toEqual(["gas"]);
  });

  // TST-018 · level: unit · module: MOD-hazard-precheck
  // guards: PRECHECK-COVERS-FOLLOW-UP-ANSWERS; PRECHECK-GERMAN
  // given: a harmless description and a German follow-up answer that reports a burnt smell
  // input: the two texts
  // expect: the escalation contains the kind fire-or-smoke
  it("covers a hazard in a follow-up answer", () => {
    const e = precheck(["My lamp flickers", "Es riecht verbrannt"]);
    expect(e?.hazards).toContain("fire-or-smoke");
  });
});

describe("escalations in the language of the person", () => {
  it("writes German for a German input and English otherwise", () => {
    const de = precheck(["Die Steckdose im Bad ist verschmort und wird warm."]);
    const en = precheck(["The socket in the bathroom is scorched and gets warm."]);
    expect(de?.reason).toMatch(/^Es gibt keine Anleitung\./);
    expect(de?.reason).toContain("Überhitzte oder verschmorte Elektrik");
    expect(de?.actions[0]).toMatch(/beschädigte Teil/);
    expect(de?.professionals).toEqual(["Elektrofachkraft"]);
    expect(en?.reason).toMatch(/^No instructions are given\./);
  });
  it("has a German text for every kind, with the same number of actions", async () => {
    const { CATALOGUE } = await import("./catalogue");
    const { GERMAN_TEXTS } = await import("./catalogue-de");
    for (const e of CATALOGUE) {
      const de = GERMAN_TEXTS[e.kind];
      expect(de, e.kind).toBeDefined();
      expect(de.actions, e.kind).toHaveLength(e.actions.length);
      expect(de.label.length + de.why.length + de.professional.length).toBeGreaterThan(0);
    }
  });
  it("keeps the risk, the hazards and the generic case the same in German", () => {
    const en = escalationFor(["gas", "refrigerant-circuit"], "output");
    const de = escalationFor(["gas", "refrigerant-circuit"], "output", "de");
    expect([de.risk, de.hazards, de.origin]).toEqual([en.risk, en.hazards, en.origin]);
    expect(de.actions).toHaveLength(en.actions.length);
    expect(escalationFor([], "output", "de").reason).toMatch(/^Es gibt keine Anleitung/);
  });
});
