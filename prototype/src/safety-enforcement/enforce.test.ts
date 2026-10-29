import { describe, expect, it } from "vitest";

import { FIXED_TOPICS } from "../case-model";
import type { Answer, CaseOutcome, WorkPackage } from "../case-model";
import { detectHazards } from "../hazard-precheck";
import { draft, guide, pkg, step } from "./fixtures";
import { FIXED_TEXTS, enforceSafety, enforceStepAnswer } from "./index";

const ctx = (round: 0 | 1 | 2 = 0, answers: Answer[] = []) => ({ round, answers });
const withPkgs = (...packages: WorkPackage[]) => ({
  options: [{ id: "o1", kind: "repair" as const, title: "Repair", packages }],
});
function guidance(o: CaseOutcome) {
  if (o.type !== "guidance") throw new Error(`expected guidance, got ${o.type}`);
  return o;
}
function firstPkg(o: CaseOutcome): WorkPackage {
  return guidance(o).options[0]!.packages[0]!;
}
const answer = (topic: string, notSure = false): Answer => ({
  questionId: topic,
  topic,
  text: notSure ? "" : "x",
  notSure,
});

describe("fixed texts", () => {
  it("raise no hazard themselves", () => {
    for (const t of [FIXED_TEXTS.shutOffWater, FIXED_TEXTS.unplug, FIXED_TEXTS.lockOut]) {
      expect(detectHazards(t)).toEqual([]);
    }
  });
});

describe("rule 1: escalation (NO-GUIDE-AT-HIGH-RISK)", () => {
  it.each(["high", "critical"] as const)(
    "turns a guide with risk %s into an escalation",
    (risk) => {
      const o = enforceSafety(draft({ risk }), ctx());
      expect(o.type).toBe("escalation");
      expect(JSON.stringify(o)).not.toContain("Unscrew the cap");
      if (o.type === "escalation") expect(o.escalation.origin).toBe("output");
    },
  );
  it("escalates out-of-scope work with that kind, whatever the risk", () => {
    const o = enforceSafety(draft({ outOfScope: "chimney" }), ctx());
    expect(o.type === "escalation" && o.escalation.hazards).toContain("chimney");
  });
  it("keeps the hazards the draft names", () => {
    const o = enforceSafety(draft({ risk: "critical", hazards: ["gas"] }), ctx());
    expect(o.type === "escalation" && o.escalation.risk).toBe("critical");
  });
  it("ends the run before any later rule", () => {
    const o = enforceSafety(draft({ risk: "high", riskUncertain: true }), ctx(2));
    expect(o.type).toBe("escalation");
  });
});

describe("rule 1b: hazards in the output text", () => {
  it("escalates a scorched socket in the photo description", () => {
    const o = enforceSafety(
      draft({ photoDescription: "The socket is scorched and the plastic has melted." }),
      ctx(),
    );
    expect(o.type).toBe("escalation");
  });
  it("escalates a low-risk guide whose step opens a distribution board", () => {
    const p = pkg({ guide: guide([step(1, "Open the distribution board and swap the fuse.")]) });
    expect(enforceSafety(draft(withPkgs(p)), ctx()).type).toBe("escalation");
  });
  it("escalates on a hazard in a package title or reason", () => {
    expect(enforceSafety(draft(withPkgs(pkg({ title: "Gas pipe fix" }))), ctx()).type).toBe(
      "escalation",
    );
    expect(
      enforceSafety(draft(withPkgs(pkg({ reason: "I smell gas near it." }))), ctx()).type,
    ).toBe("escalation");
  });
  it("escalates on a hazard in the summary", () => {
    expect(enforceSafety(draft({ summary: "There is a gas leak." }), ctx()).type).toBe(
      "escalation",
    );
  });
  it("passes a harmless draft", () => {
    expect(enforceSafety(draft(), ctx()).type).toBe("guidance");
  });
});

describe("rule 2: unclear risk (UNCLEAR-CASES-CONSERVATIVE)", () => {
  const q = {
    id: "q1",
    topic: "tap.age",
    text: "How old is the tap?",
    termExplanations: [],
  };
  it("returns the draft's questions before round 2", () => {
    const o = enforceSafety(
      draft({ riskUncertain: true, questions: [q], missing: ["age"] }),
      ctx(0),
    );
    expect(o).toMatchObject({ type: "questions", round: 1, questions: [q] });
  });
  it("escalates before round 2 when there are no questions", () => {
    expect(enforceSafety(draft({ riskUncertain: true }), ctx(1)).type).toBe("escalation");
  });
  it("escalates at round 2 even with questions", () => {
    expect(enforceSafety(draft({ riskUncertain: true, questions: [q] }), ctx(2)).type).toBe(
      "escalation",
    );
  });
});

describe("rule 3: device model (MODEL-BEFORE-PARTS)", () => {
  const part = {
    id: "m1",
    name: "Pump",
    quantity: { amount: 1, unit: "piece" as const },
    spec: {},
    replacementPart: true,
    safetyCritical: "no" as const,
    printable: false,
  };
  const material = { ...part, id: "m2", name: "Tape", replacementPart: false };
  const deviceDraft = (extra = {}) =>
    draft({
      device: { concernsDevice: true, modelKnown: false },
      ...withPkgs(
        pkg({ guide: guide([step(1, "Swap the part.")], { materials: [part, material] }) }),
      ),
      ...extra,
    });

  it("asks model and variant first and names no part before round 2", () => {
    const o = enforceSafety(
      deviceDraft({
        kind: "questions",
        questions: [{ id: "q9", topic: "x.y", text: "Other?", termExplanations: [] }],
      }),
      ctx(0),
    );
    expect(o.type).toBe("questions");
    if (o.type !== "questions") return;
    expect(o.questions.map((q) => q.topic).slice(0, 2)).toEqual([
      FIXED_TOPICS.deviceModel,
      FIXED_TOPICS.deviceVariant,
    ]);
    expect(o.questions.map((q) => q.topic)).toContain("x.y");
    expect(JSON.stringify(o)).not.toContain("Pump");
  });
  it("asks even when the draft is an answer", () => {
    expect(enforceSafety(deviceDraft(), ctx(1))).toMatchObject({ type: "questions", round: 2 });
  });
  it("removes replacement parts and adds the assumption at round 2", () => {
    const o = guidance(enforceSafety(deviceDraft(), ctx(2)));
    const mats = o.options[0]!.packages[0]!.guide!.materials.map((m) => m.name);
    expect(mats).toEqual(["Tape"]);
    expect(o.assumptions).toContain(FIXED_TEXTS.unknownModel);
  });
  it("does not ask again for a topic the user answered, and still names no part", () => {
    const o = guidance(
      enforceSafety(
        deviceDraft(),
        ctx(1, [answer(FIXED_TOPICS.deviceModel, true), answer(FIXED_TOPICS.deviceVariant, true)]),
      ),
    );
    expect(o.options[0]!.packages[0]!.guide!.materials.map((m) => m.name)).toEqual(["Tape"]);
    expect(o.assumptions).toContain(FIXED_TEXTS.unknownModel);
  });
  it("does nothing when the case concerns no device or the model is known", () => {
    const base = withPkgs(pkg({ guide: guide([step(1, "x")], { materials: [part] }) }));
    for (const device of [
      { concernsDevice: false, modelKnown: false },
      { concernsDevice: true, modelKnown: true },
    ]) {
      const o = guidance(enforceSafety(draft({ device, ...base }), ctx(0)));
      expect(o.options[0]!.packages[0]!.guide!.materials).toHaveLength(1);
      expect(o.assumptions).toEqual([]);
    }
  });
});

describe("rule 4: person-carrying furniture", () => {
  const chair = (extra: Partial<WorkPackage> = {}) =>
    pkg({
      flags: { opensMainsHousing: false, carriesPerson: true, waterRelated: false },
      ...extra,
    });
  const topics = (o: CaseOutcome) =>
    o.type === "questions" ? o.questions.map((q) => q.topic) : [];

  it("asks load and dimensions when neither is answered", () => {
    const o = enforceSafety(draft(withPkgs(chair())), ctx(0));
    expect(topics(o)).toEqual([FIXED_TOPICS.furnitureLoad, FIXED_TOPICS.furnitureDimensions]);
  });
  it("asks only for the missing one", () => {
    const o = enforceSafety(draft(withPkgs(chair())), ctx(0, [answer(FIXED_TOPICS.furnitureLoad)]));
    expect(topics(o)).toEqual([FIXED_TOPICS.furnitureDimensions]);
  });
  it("treats a 'not sure' as missing", () => {
    const o = enforceSafety(
      draft(withPkgs(chair())),
      ctx(1, [answer(FIXED_TOPICS.furnitureLoad, true), answer(FIXED_TOPICS.furnitureDimensions)]),
    );
    expect(topics(o)).toEqual([FIXED_TOPICS.furnitureLoad]);
    expect(o).toMatchObject({ round: 2 });
  });
  it("keeps the label when both are answered", () => {
    const o = enforceSafety(
      draft(withPkgs(chair())),
      ctx(0, [answer(FIXED_TOPICS.furnitureLoad), answer(FIXED_TOPICS.furnitureDimensions)]),
    );
    expect(firstPkg(o).label).toBe("diy");
  });
  it("sets not-recommended with deciding information at round 2 and drops the guide", () => {
    const p = firstPkg(
      enforceSafety(
        draft(withPkgs(chair())),
        ctx(2, [
          answer(FIXED_TOPICS.furnitureLoad, true),
          answer(FIXED_TOPICS.furnitureDimensions, true),
        ]),
      ),
    );
    expect(p.label).toBe("not-recommended");
    expect(p.decidingInformation).toHaveLength(2);
    expect(p.guide).toBeUndefined();
  });
});

describe("rule 5: questions", () => {
  const q = { id: "q1", topic: "a.b", text: "?", termExplanations: [] };
  it("returns questions of a questions draft with the next round", () => {
    const o = enforceSafety(draft({ kind: "questions", questions: [q], missing: ["a"] }), ctx(1));
    expect(o).toEqual({ type: "questions", round: 2, missing: ["a"], questions: [q] });
  });
  it("does not return questions at round 2", () => {
    expect(enforceSafety(draft({ kind: "questions", questions: [q] }), ctx(2)).type).toBe(
      "guidance",
    );
  });
});

describe("rules 6 to 8: labels and guide removal", () => {
  const mains = {
    flags: { opensMainsHousing: true, carriesPerson: false, waterRelated: false },
  };
  it("labels a flagged mains housing professional-only, without guide (NO-OPENING-MAINS-HOUSINGS)", () => {
    const p = firstPkg(enforceSafety(draft(withPkgs(pkg(mains))), ctx()));
    expect(p.label).toBe("professional-only");
    expect(p.guide).toBeUndefined();
  });
  it("labels a package whose step opens a housing professional-only (rule 6b)", () => {
    const p = pkg({ guide: guide([step(1, "Open the housing of the power supply.")]) });
    expect(firstPkg(enforceSafety(draft(withPkgs(p)), ctx())).label).toBe("professional-only");
  });
  it("never relaxes not-recommended", () => {
    const p = pkg({ label: "not-recommended", ...mains });
    expect(firstPkg(enforceSafety(draft(withPkgs(p)), ctx())).label).toBe("not-recommended");
  });
  it("takes the alternative label when uncertain", () => {
    const p = firstPkg(
      enforceSafety(
        draft(withPkgs(pkg({ labelUncertain: true, alternativeLabel: "professional-only" }))),
        ctx(),
      ),
    );
    expect(p.label).toBe("professional-only");
    expect(p.guide).toBeUndefined();
  });
  it("takes the next stricter label when uncertain without alternative", () => {
    const p = firstPkg(enforceSafety(draft(withPkgs(pkg({ labelUncertain: true }))), ctx()));
    expect(p.label).toBe("diy-preparation");
  });
  it("keeps not-recommended as the strictest when uncertain", () => {
    const p = pkg({ label: "not-recommended", labelUncertain: true });
    expect(firstPkg(enforceSafety(draft(withPkgs(p)), ctx())).label).toBe("not-recommended");
  });
  it("removes the guide of a professional-only package", () => {
    const d = draft(withPkgs(pkg({ label: "professional-only" })));
    expect(firstPkg(enforceSafety(d, ctx())).guide).toBeUndefined();
  });
});

describe("rule 9: preparation", () => {
  it("adds the agree-beforehand text", () => {
    const p = firstPkg(enforceSafety(draft(withPkgs(pkg({ label: "diy-preparation" }))), ctx()));
    expect(p.agreeBeforehand).toBe(FIXED_TEXTS.agreeBeforehand);
    expect(p.guide).toBeDefined();
  });
  it("adds nothing to a diy package", () => {
    expect(firstPkg(enforceSafety(draft(), ctx())).agreeBeforehand).toBeUndefined();
  });
});

describe("rule 10: fixed safety steps", () => {
  const texts = (o: CaseOutcome) => firstPkg(o).guide!.steps.map((s) => s.text);
  const water = (g = guide([step(1, "Remove the cap."), step(2, "Swap the washer.")])) =>
    pkg({
      flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: true },
      guide: g,
    });

  it("starts a water guide with the shut-off step and renumbers", () => {
    const o = enforceSafety(draft(withPkgs(water())), ctx());
    expect(texts(o)[0]).toBe(FIXED_TEXTS.shutOffWater);
    expect(firstPkg(o).guide!.steps.map((s) => s.n)).toEqual([1, 2, 3]);
    expect(firstPkg(o).guide!.steps[0]!.fixedSafetyStep).toBe(true);
  });
  it("adds no second shut-off step when the guide has it", () => {
    const g = guide([step(1, FIXED_TEXTS.shutOffWater, { fixedSafetyStep: true }), step(2, "Go.")]);
    const o = enforceSafety(draft(withPkgs(water(g))), ctx());
    expect(texts(o).filter((t) => t === FIXED_TEXTS.shutOffWater)).toHaveLength(1);
  });
  it("adds no shut-off step to a dry guide", () => {
    expect(texts(enforceSafety(draft(), ctx()))).not.toContain(FIXED_TEXTS.shutOffWater);
  });
  it("puts the unplug step before the first opening step", () => {
    const g = guide([
      step(1, "Clean it."),
      step(2, "Remove the back cover.", { opensDevice: true }),
      step(3, "Look."),
    ]);
    const o = enforceSafety(draft(withPkgs(pkg({ guide: g }))), ctx());
    expect(texts(o)).toEqual(["Clean it.", FIXED_TEXTS.unplug, "Remove the back cover.", "Look."]);
    expect(firstPkg(o).guide!.steps.map((s) => s.n)).toEqual([1, 2, 3, 4]);
  });
  it("adds the unplug step once for several opening steps", () => {
    const g = guide([
      step(1, "Remove the cover.", { opensDevice: true }),
      step(2, "Remove the fan.", { opensDevice: true }),
    ]);
    const o = enforceSafety(draft(withPkgs(pkg({ guide: g }))), ctx());
    expect(texts(o).filter((t) => t === FIXED_TEXTS.unplug)).toHaveLength(1);
  });
  it("puts shut-off first and unplug before opening in one guide", () => {
    const g = guide([step(1, "Open it.", { opensDevice: true })]);
    const o = enforceSafety(draft(withPkgs(water(g))), ctx());
    expect(texts(o)).toEqual([FIXED_TEXTS.shutOffWater, FIXED_TEXTS.unplug, "Open it."]);
  });
  it("adds the lock-out warning when a step switches off a circuit (NO-BREAKER-ONLY-ISOLATION)", () => {
    const g = guide([step(1, "Switch off the circuit.", { switchesOffCircuit: true })], {
      warnings: ["Be careful."],
    });
    const w = firstPkg(enforceSafety(draft(withPkgs(pkg({ guide: g }))), ctx())).guide!.warnings;
    expect(w).toEqual(["Be careful.", FIXED_TEXTS.lockOut]);
  });
  it("adds no lock-out warning otherwise", () => {
    expect(firstPkg(enforceSafety(draft(), ctx())).guide!.warnings).toEqual([]);
  });
  it("does not touch the input draft", () => {
    const d = draft(withPkgs(water()));
    const before = structuredClone(d);
    enforceSafety(d, ctx());
    expect(d).toEqual(before);
  });
});

describe("rule 11: safety-critical status (NO-PRINTED-SAFETY-PARTS)", () => {
  it("turns unclear into yes", () => {
    const m = {
      id: "m",
      name: "Bracket",
      quantity: { amount: 1, unit: "piece" as const },
      spec: {},
      replacementPart: false,
      safetyCritical: "unclear" as const,
      printable: true,
    };
    const g = guide([step(1, "x")], { materials: [m, { ...m, id: "n", safetyCritical: "no" }] });
    const mats = firstPkg(enforceSafety(draft(withPkgs(pkg({ guide: g }))), ctx())).guide!
      .materials;
    expect(mats.map((x) => x.safetyCritical)).toEqual(["yes", "no"]);
  });
});

describe("rule 12: result", () => {
  it("returns guidance with summary, assumptions, photoAlt, no notices, options unranked", () => {
    const d = draft({
      assumptions: ["a"],
      photoDescription: "A tap.",
      options: [
        { id: "o1", kind: "buy-new", title: "Buy", packages: [pkg({ id: "a" })] },
        { id: "o2", kind: "repair", title: "Fix", packages: [pkg({ id: "b" })] },
      ],
    });
    const o = guidance(enforceSafety(d, ctx()));
    expect(o).toMatchObject({
      summary: "A dripping tap.",
      assumptions: ["a"],
      photoAlt: "A tap.",
      notices: [],
    });
    expect(o.options.map((x) => x.id)).toEqual(["o1", "o2"]);
  });
});

describe("enforceStepAnswer", () => {
  const ok = { answer: "Turn it gently.", risk: "low" as const, hazards: [] };
  it("returns a harmless answer", () => {
    expect(enforceStepAnswer(ok)).toEqual({ type: "answer", text: "Turn it gently." });
  });
  it.each(["high", "critical"] as const)("escalates risk %s", (risk) => {
    const o = enforceStepAnswer({ ...ok, risk, hazards: ["gas"] });
    expect(o.type === "escalation" && o.escalation.origin).toBe("output");
  });
  it("escalates a hazard found in the answer text", () => {
    expect(enforceStepAnswer({ ...ok, answer: "Open the distribution board." }).type).toBe(
      "escalation",
    );
  });
});
