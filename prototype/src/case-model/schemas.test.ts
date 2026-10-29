import { describe, expect, it } from "vitest";

import { FIXED_TOPICS, SAFETY_RULES_VERSION, SKILL_AREAS, schemas } from "./index";

const quantity = { amount: 2, unit: "piece" };

const pkg = {
  id: "p1",
  title: "Replace the seal",
  area: "plumbing",
  label: "diy",
  reason: "Simple work on a tap.",
  labelUncertain: false,
  decidingInformation: [],
  handoverBrief: "Replace the seal of the kitchen tap.",
  flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: true },
  guide: {
    diagnosis: "The seal is worn.",
    tools: [{ id: "t1", name: "Spanner", rentable: false }],
    materials: [
      {
        id: "m1",
        name: "Seal",
        quantity,
        spec: { dimensionsMm: { diameter: 20 }, material: "rubber" },
        replacementPart: true,
        safetyCritical: "no",
        printable: false,
      },
    ],
    steps: [
      {
        n: 1,
        text: "Shut off the water.",
        opensDevice: false,
        switchesOffCircuit: false,
        fixedSafetyStep: false,
        imageIds: [],
      },
    ],
    estimatedMinutes: { min: 10, max: 20 },
    warnings: ["Water may drip."],
  },
};

const option = { id: "o1", kind: "repair", title: "Repair the tap", packages: [pkg] };

const examples = {
  caseRequest: {
    description: "My tap drips.",
    photo: { mediaType: "image/jpeg", dataBase64: "AAAA" },
    answers: [{ questionId: "q1", topic: FIXED_TOPICS.deviceModel, text: "X1", notSure: false }],
    round: 0,
    inventory: { materials: [{ name: "Seal", quantity }], tools: [{ name: "Spanner" }] },
  },
  assessmentDraft: {
    kind: "answer",
    missing: [],
    questions: [
      {
        id: "q1",
        topic: "device.model",
        text: "Which model?",
        termExplanations: [{ term: "variant", explanation: "A version of the model." }],
        prefill: "X1",
      },
    ],
    device: { concernsDevice: false, modelKnown: false },
    outOfScope: null,
    risk: "low",
    riskUncertain: false,
    hazards: [],
    summary: "A tap drips.",
    photoDescription: null,
    assumptions: ["The tap is a mixer tap."],
    options: [option],
    notices: [{ kind: "rented-property", certainty: "possible" }],
  },
  explainRequest: {
    packageId: "p1",
    area: "plumbing",
    level: "beginner",
    steps: [{ n: 1, text: "Shut off the water." }],
    onlyStep: null,
    simpler: false,
  },
  explanationDraft: { steps: [{ n: 1, basics: "The main valve is near the meter." }] },
  stepQuestionRequest: {
    summary: "A tap drips.",
    pkg,
    currentStep: 1,
    question: "Which way do I turn it?",
  },
  stepAnswerDraft: { answer: "Clockwise.", risk: "low", hazards: [] },
};

type SchemaName = keyof typeof schemas;

// One field per type that the schema must demand.
const required: Record<SchemaName, string> = {
  caseRequest: "description",
  assessmentDraft: "summary",
  explainRequest: "packageId",
  explanationDraft: "steps",
  stepQuestionRequest: "question",
  stepAnswerDraft: "answer",
};

function without(value: object, key: string): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...value };
  delete copy[key];
  return copy;
}

describe("schemas", () => {
  it("has the six schemas of the interface", () => {
    expect(Object.keys(schemas).sort()).toEqual(Object.keys(examples).sort());
  });

  describe.each(Object.keys(examples) as SchemaName[])("%s", (name) => {
    it("accepts a valid example", () => {
      const result = schemas[name].safeParse(examples[name]);
      expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    });

    it("rejects an example that misses a field", () => {
      expect(schemas[name].safeParse(without(examples[name], required[name])).success).toBe(false);
    });

    it("rejects a value that is not an object", () => {
      expect(schemas[name].safeParse("text").success).toBe(false);
    });
  });

  it("accepts a case request without a photo", () => {
    expect(schemas.caseRequest.safeParse(without(examples.caseRequest, "photo")).success).toBe(
      true,
    );
  });

  it("rejects a third round of questions and a wrong photo type", () => {
    const base = examples.caseRequest;
    expect(schemas.caseRequest.safeParse({ ...base, round: 3 }).success).toBe(false);
    expect(
      schemas.caseRequest.safeParse({ ...base, photo: { mediaType: "image/png", dataBase64: "A" } })
        .success,
    ).toBe(false);
  });

  it("rejects an unknown label, risk, hazard or skill area", () => {
    const draft = examples.assessmentDraft;
    expect(schemas.assessmentDraft.safeParse({ ...draft, risk: "extreme" }).success).toBe(false);
    expect(schemas.assessmentDraft.safeParse({ ...draft, hazards: ["lightning"] }).success).toBe(
      false,
    );
    expect(
      schemas.assessmentDraft.safeParse({
        ...draft,
        options: [{ ...option, packages: [{ ...pkg, label: "easy" }] }],
      }).success,
    ).toBe(false);
    expect(
      schemas.explainRequest.safeParse({ ...examples.explainRequest, area: "sailing" }).success,
    ).toBe(false);
  });

  it("rejects a step answer that does not name risk and hazards", () => {
    expect(schemas.stepAnswerDraft.safeParse({ answer: "Clockwise." }).success).toBe(false);
  });
});

describe("vocabulary constants", () => {
  it("names the skill areas and the fixed topics", () => {
    expect(SKILL_AREAS).toHaveLength(9);
    expect(FIXED_TOPICS).toEqual({
      deviceModel: "device.model",
      deviceVariant: "device.variant",
      furnitureLoad: "furniture.load",
      furnitureDimensions: "furniture.dimensions",
    });
  });

  it("has a version of the safety rules", () => {
    expect(SAFETY_RULES_VERSION).not.toBe("");
  });
});
