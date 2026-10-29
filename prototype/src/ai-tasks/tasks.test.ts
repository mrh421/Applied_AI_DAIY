import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiError } from "../ai-gateway";
import type { AiContent } from "../ai-gateway";
import { schemas } from "../case-model";
import type { CaseRequest, ExplainRequest, StepQuestionRequest } from "../case-model";
import { illustrationIndex } from "../illustrations";

const generateJson = vi.hoisted(() => vi.fn());
vi.mock("../ai-gateway", async (orig) => ({
  ...(await orig<typeof import("../ai-gateway")>()),
  generateJson,
}));

import { PROMPT_VERSION, draftAssessment, draftExplanation, draftStepAnswer } from "./index";

type Call = { system: string; content: AiContent[]; schema: unknown };
const lastCall = (): Call => generateJson.mock.calls.at(-1)![0] as Call;
const textOf = (c: Call) =>
  c.content.flatMap((p) => (p.type === "text" ? [p.text] : [])).join("\n");

const caseReq = (over: Partial<CaseRequest> = {}): CaseRequest => ({
  description: "The kitchen tap drips",
  answers: [{ questionId: "q1", topic: "device.model", text: "Grohe X", notSure: false }],
  round: 1,
  inventory: {
    materials: [{ name: "PTFE tape", quantity: { amount: 1, unit: "piece" } }],
    tools: [{ name: "adjustable spanner" }],
  },
  ...over,
});

const explainReq = (over: Partial<ExplainRequest> = {}): ExplainRequest => ({
  packageId: "p1",
  area: "plumbing",
  level: "beginner",
  steps: [
    { n: 1, text: "Close the stop valve." },
    { n: 2, text: "Remove the cartridge." },
  ],
  onlyStep: null,
  simpler: false,
  ...over,
});

const stepReq = (): StepQuestionRequest => ({
  summary: "A dripping tap",
  currentStep: 2,
  question: "What is a cartridge?",
  pkg: {
    id: "p1",
    title: "Replace cartridge",
    area: "plumbing",
    label: "diy",
    reason: "Simple",
    labelUncertain: false,
    decidingInformation: [],
    handoverBrief: "brief",
    flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: true },
  },
});

beforeEach(() => {
  generateJson.mockReset();
  generateJson.mockResolvedValue({ any: "draft" });
});

describe("PROMPT_VERSION", () => {
  it("is a non-empty string", () => {
    expect(PROMPT_VERSION).toMatch(/\S/);
  });
});

describe("draftAssessment", () => {
  it("returns the unvalidated model output and uses the assessment schema", async () => {
    await expect(draftAssessment(caseReq())).resolves.toEqual({ any: "draft" });
    expect(lastCall().schema).toBe(schemas.assessmentDraft);
  });

  it("sends description, answers, round, inventory and the illustration index", async () => {
    await draftAssessment(caseReq());
    const text = textOf(lastCall());
    expect(text).toContain("The kitchen tap drips");
    expect(text).toContain("Grohe X");
    expect(text).toContain("device.model");
    expect(text).toContain("PTFE tape");
    expect(text).toContain("adjustable spanner");
    expect(text).toMatch(/round[^\n]*1/i);
    for (const { id } of illustrationIndex()) expect(text).toContain(id);
  });

  it("contains no profile field", async () => {
    await draftAssessment(caseReq());
    const c = lastCall();
    const all = `${c.system}\n${textOf(c)}`;
    expect(all).not.toMatch(/skill ?level|skill profile|beginner|some-experience|experienced/i);
  });

  it("passes the photo as image content, and none when absent", async () => {
    await draftAssessment(caseReq({ photo: { mediaType: "image/jpeg", dataBase64: "QUJD" } }));
    expect(lastCall().content).toContainEqual({
      type: "image",
      mediaType: "image/jpeg",
      dataBase64: "QUJD",
    });
    await draftAssessment(caseReq());
    expect(lastCall().content.some((p) => p.type === "image")).toBe(false);
  });

  it("gives instructions on the required behaviour", async () => {
    await draftAssessment(caseReq());
    const s = lastCall().system.toLowerCase();
    expect(s).toContain("model");
    expect(s).toContain("variant");
    expect(s).toContain("assumption");
    expect(s).toContain("handover");
    expect(s).toContain("package");
    expect(s).toContain("deciding");
    expect(s).toContain("language of the user");
  });

  it("forbids questions at round 2 and not before", async () => {
    await draftAssessment(caseReq({ round: 2 }));
    const r2 = `${lastCall().system}\n${textOf(lastCall())}`;
    expect(r2).toMatch(/do not ask (any )?questions|ask no questions/i);
    await draftAssessment(caseReq({ round: 0 }));
    const r0 = `${lastCall().system}\n${textOf(lastCall())}`;
    expect(r0).not.toMatch(/do not ask (any )?questions|ask no questions/i);
  });

  it("states the writing rules", async () => {
    await draftAssessment(caseReq());
    const s = lastCall().system.toLowerCase();
    expect(s).toContain("short sentences");
    expect(s).toContain("numbered");
    expect(s).toContain("everyday language");
  });

  it("passes an AiError on unchanged", async () => {
    const err = new AiError("timeout", "slow");
    generateJson.mockRejectedValue(err);
    await expect(draftAssessment(caseReq())).rejects.toBe(err);
  });
});

describe("draftExplanation", () => {
  it("uses the explanation schema and returns the output", async () => {
    await expect(draftExplanation(explainReq())).resolves.toEqual({ any: "draft" });
    expect(lastCall().schema).toBe(schemas.explanationDraft);
  });

  it("carries exactly the requested steps and the level", async () => {
    await draftExplanation(explainReq());
    const text = textOf(lastCall());
    expect(text).toContain("Close the stop valve.");
    expect(text).toContain("Remove the cartridge.");
    expect(text).toContain("beginner");
    await draftExplanation(explainReq({ onlyStep: 2 }));
    const one = textOf(lastCall());
    expect(one).toContain("Remove the cartridge.");
    expect(one).not.toContain("Close the stop valve.");
  });

  it("asks for simpler wording only when simpler is set", async () => {
    await draftExplanation(explainReq({ simpler: true }));
    expect(`${lastCall().system}${textOf(lastCall())}`).toMatch(/simpler/i);
    await draftExplanation(explainReq());
    expect(`${lastCall().system}${textOf(lastCall())}`).not.toMatch(/simpler/i);
  });

  it("passes an AiError on unchanged", async () => {
    const err = new AiError("refused", "no");
    generateJson.mockRejectedValue(err);
    await expect(draftExplanation(explainReq())).rejects.toBe(err);
  });
});

describe("draftStepAnswer", () => {
  it("uses the step answer schema and sends package, step and question", async () => {
    await expect(draftStepAnswer(stepReq())).resolves.toEqual({ any: "draft" });
    expect(lastCall().schema).toBe(schemas.stepAnswerDraft);
    const text = textOf(lastCall());
    expect(text).toContain("Replace cartridge");
    expect(text).toContain("A dripping tap");
    expect(text).toContain("What is a cartridge?");
    expect(text).toMatch(/step[^\n]*2/i);
  });

  it("passes an AiError on unchanged", async () => {
    const err = new AiError("unavailable", "down");
    generateJson.mockRejectedValue(err);
    await expect(draftStepAnswer(stepReq())).rejects.toBe(err);
  });
});
