import type { AssessmentDraft, ExplainRequest, WorkPackage } from "../case-model";

// Valid drafts shared by the tests of this module. Each test copies and breaks one thing.

export const diyPackage: WorkPackage = {
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
        quantity: { amount: 1, unit: "piece" },
        spec: { dimensionsMm: { diameter: 20 } },
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
        fixedSafetyStep: true,
        imageIds: ["water-shut-off-valve"],
      },
      {
        n: 2,
        text: "Unscrew the tap and replace the seal.",
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

export const answerDraft: AssessmentDraft = {
  kind: "answer",
  missing: [],
  questions: [],
  device: { concernsDevice: false, modelKnown: false },
  outOfScope: null,
  risk: "low",
  riskUncertain: false,
  hazards: [],
  summary: "A tap drips.",
  photoDescription: null,
  assumptions: [],
  options: [{ id: "o1", kind: "repair", title: "Repair the tap", packages: [diyPackage] }],
  notices: [],
};

export const questionsDraft: AssessmentDraft = {
  ...answerDraft,
  kind: "questions",
  missing: ["The model of the device"],
  questions: [
    {
      id: "q1",
      topic: "device.model",
      text: "Which model is it?",
      termExplanations: [],
    },
  ],
  summary: "",
  options: [],
};

export const explainRequest: ExplainRequest = {
  packageId: "p1",
  area: "plumbing",
  level: "beginner",
  steps: [
    { n: 1, text: "Shut off the water." },
    { n: 2, text: "Unscrew the tap." },
  ],
  onlyStep: null,
  simpler: false,
};
