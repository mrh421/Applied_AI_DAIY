import type { AssessmentDraft, Guide, Step, WorkPackage } from "../case-model";

export function step(n: number, text: string, extra: Partial<Step> = {}): Step {
  return {
    n,
    text,
    opensDevice: false,
    switchesOffCircuit: false,
    fixedSafetyStep: false,
    imageIds: [],
    ...extra,
  };
}

export function guide(steps: Step[], extra: Partial<Guide> = {}): Guide {
  return {
    diagnosis: "The washer is worn.",
    tools: [],
    materials: [],
    steps,
    estimatedMinutes: { min: 10, max: 20 },
    warnings: [],
    ...extra,
  };
}

export function pkg(extra: Partial<WorkPackage> = {}): WorkPackage {
  return {
    id: "p1",
    title: "Replace the washer",
    area: "other",
    label: "diy",
    reason: "Simple work.",
    labelUncertain: false,
    decidingInformation: [],
    handoverBrief: "Brief.",
    flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: false },
    guide: guide([step(1, "Unscrew the cap."), step(2, "Swap the washer.")]),
    ...extra,
  };
}

export function draft(extra: Partial<AssessmentDraft> = {}): AssessmentDraft {
  return {
    kind: "answer",
    missing: [],
    questions: [],
    device: { concernsDevice: false, modelKnown: true },
    outOfScope: null,
    risk: "low",
    riskUncertain: false,
    hazards: [],
    summary: "A dripping tap.",
    photoDescription: null,
    assumptions: [],
    options: [{ id: "o1", kind: "repair", title: "Repair", packages: [pkg()] }],
    notices: [],
    ...extra,
  };
}
