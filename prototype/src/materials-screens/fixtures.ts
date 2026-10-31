import type { CaseOutcome, Guide, MaterialNeed, ToolNeed, Unit, WorkPackage } from "../case-model";
import type { CaseSession } from "../case-session";
import type { Offer } from "../catalogue";
import type { CaseRecord } from "../history";

// Shared by the tests of this module. Each test builds the case it needs from these.

export function material(
  id: string,
  name: string,
  amount: number,
  unit: Unit = "piece",
  over: Partial<MaterialNeed> = {},
): MaterialNeed {
  return {
    id,
    name,
    quantity: { amount, unit },
    spec: {},
    replacementPart: true,
    safetyCritical: "no",
    printable: false,
    ...over,
  };
}

export function tool(id: string, name: string, rentable = false): ToolNeed {
  return { id, name, rentable };
}

export function guide(materials: MaterialNeed[], tools: ToolNeed[] = []): Guide {
  return {
    diagnosis: "Worn.",
    tools,
    materials,
    steps: [
      {
        n: 1,
        text: "Do it.",
        opensDevice: false,
        switchesOffCircuit: false,
        fixedSafetyStep: false,
        imageIds: [],
      },
    ],
    estimatedMinutes: { min: 5, max: 10 },
    warnings: [],
  };
}

function pkg(id: string, g: Guide): WorkPackage {
  return {
    id,
    title: `Package ${id}`,
    area: "plumbing",
    label: "diy",
    reason: "Simple.",
    labelUncertain: false,
    decidingInformation: [],
    handoverBrief: "Brief.",
    flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: false },
    guide: g,
  };
}

export function guidance(options: { id: string; guide: Guide }[]): CaseOutcome {
  return {
    type: "guidance",
    summary: "A tap drips.",
    assumptions: [],
    options: options.map((o, i) => ({
      id: o.id,
      kind: i === 0 ? "repair" : "buy-new",
      title: `Option ${o.id}`,
      packages: [pkg(`p-${o.id}`, o.guide)],
    })),
    notices: [],
    photoAlt: null,
  };
}

export function session(outcome: CaseOutcome | null, over: Partial<CaseRecord> = {}): CaseSession {
  return {
    record: {
      id: "c1",
      createdAt: "2026-10-31T10:00:00.000Z",
      rulesVersion: "v",
      chosenOffers: {},
      status: "ongoing",
      description: "A tap drips.",
      hadPhoto: false,
      answers: [],
      round: 0,
      outcome,
      chosenOptionId: null,
      explanations: {},
      checked: {},
      notes: "",
      budget: null,
      materialsUsed: [],
      ...over,
    },
    photo: null,
    pending: null,
    staleRules: false,
  };
}

export function offer(over: Partial<Offer> & { id: string }): Offer {
  return {
    title: "Test offer",
    condition: "new",
    unitPrice: {
      certainty: "verified",
      value: { amount: 5, currency: "EUR" },
      source: "Price list",
    },
    packSize: { amount: 1, unit: "piece" },
    spec: {
      dimensionsMm: { certainty: "verified", value: { diameter: 20 }, source: "Data sheet" },
      material: { certainty: "verified", value: "brass", source: "Data sheet" },
      function: { certainty: "verified", value: "seal", source: "Data sheet" },
    },
    compatibility: { certainty: "verified", value: "fits", source: "Maker" },
    availability: { certainty: "verified", value: "in-stock", source: "Shop" },
    dataAsOf: "2026-10-01",
    source: { name: "Sample shop", url: "https://example.org/source" },
    sellerUrl: "https://example.org/seller",
    sustainabilityReason: null,
    ...over,
  };
}
