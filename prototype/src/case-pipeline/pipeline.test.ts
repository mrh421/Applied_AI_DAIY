import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiError } from "../ai-gateway";
import type { AiErrorCode } from "../ai-gateway";
import type { UserNotice } from "../case-model";
import {
  answerDraft,
  caseRequest,
  diyPackage,
  explainRequest,
  questionsDraft,
  stepQuestionRequest,
} from "./fixtures";
import { runAssess } from "./assess";
import { runExplain } from "./explain";
import { runStepQuestion } from "./step-question";

// MOD-ai-tasks is replaced by a counting double: a test can show that no AI call happens.
const ai = vi.hoisted(() => ({
  draftAssessment: vi.fn(),
  draftExplanation: vi.fn(),
  draftStepAnswer: vi.fn(),
}));
vi.mock("../ai-tasks", () => ({ ...ai, PROMPT_VERSION: "test-version" }));

const calls = () =>
  ai.draftAssessment.mock.calls.length +
  ai.draftExplanation.mock.calls.length +
  ai.draftStepAnswer.mock.calls.length;

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});

function notice(o: { type: string }): UserNotice {
  if (o.type !== "notice") throw new Error(`expected notice, got ${o.type}`);
  return (o as unknown as { notice: UserNotice }).notice;
}

describe("assessCase", () => {
  it("gives technical-error for invalid input, with no AI call", async () => {
    const o = await runAssess({ nonsense: true });
    expect(notice(o).reason).toBe("technical-error");
    expect(calls()).toBe(0);
  });

  it("escalates a hazard in the description with zero AI calls", async () => {
    const o = await runAssess({ ...caseRequest, description: "I smell gas in the kitchen." });
    expect(o.type).toBe("escalation");
    expect(calls()).toBe(0);
  });

  it("escalates a hazard in a follow-up answer with zero AI calls", async () => {
    const o = await runAssess({
      ...caseRequest,
      round: 1,
      answers: [
        { questionId: "q1", topic: "tap.age", text: "I smell gas near it.", notSure: false },
      ],
    });
    expect(o.type).toBe("escalation");
    expect(calls()).toBe(0);
  });

  it("returns follow-up questions", async () => {
    ai.draftAssessment.mockResolvedValue(questionsDraft);
    const o = await runAssess(caseRequest);
    expect(o).toMatchObject({ type: "questions", round: 1 });
  });

  it("gives output-rejected for a malformed draft", async () => {
    ai.draftAssessment.mockResolvedValue({ kind: "answer" });
    expect(notice(await runAssess(caseRequest)).reason).toBe("output-rejected");
  });

  it("gives output-rejected for an incomplete draft", async () => {
    ai.draftAssessment.mockResolvedValue({ ...answerDraft, summary: "" });
    expect(notice(await runAssess(caseRequest)).reason).toBe("output-rejected");
  });

  it("gives output-rejected for a prohibited path: questions at round 2", async () => {
    ai.draftAssessment.mockResolvedValue(questionsDraft);
    expect(notice(await runAssess({ ...caseRequest, round: 2 })).reason).toBe("output-rejected");
  });

  it("escalates an incomplete draft of high risk instead of giving a notice", async () => {
    ai.draftAssessment.mockResolvedValue({ ...answerDraft, risk: "high", summary: "" });
    const o = await runAssess(caseRequest);
    expect(o).toMatchObject({ type: "escalation", escalation: { origin: "output" } });
  });

  it("escalates a draft that offers a guide at critical risk", async () => {
    ai.draftAssessment.mockResolvedValue({ ...answerDraft, risk: "critical" });
    expect((await runAssess(caseRequest)).type).toBe("escalation");
  });

  it.each<AiErrorCode>([
    "config",
    "quota",
    "rate-limit",
    "refused",
    "invalid-output",
    "timeout",
    "unavailable",
  ])("gives technical-error for AiError %s", async (code) => {
    ai.draftAssessment.mockRejectedValue(new AiError(code, "x"));
    const n = notice(await runAssess(caseRequest));
    expect(n.reason).toBe("technical-error");
    expect(n.text.length).toBeGreaterThan(0);
  });

  it("gives different texts for different error codes", async () => {
    ai.draftAssessment.mockRejectedValueOnce(new AiError("quota", "x"));
    ai.draftAssessment.mockRejectedValueOnce(new AiError("timeout", "x"));
    const a = notice(await runAssess(caseRequest)).text;
    const b = notice(await runAssess(caseRequest)).text;
    expect(a).not.toBe(b);
  });

  it("gives technical-error for an unknown thrown error", async () => {
    ai.draftAssessment.mockRejectedValue(new Error("boom"));
    expect(notice(await runAssess(caseRequest)).reason).toBe("technical-error");
  });

  it("ranks guidance and carries notices", async () => {
    const buy = { id: "o2", kind: "buy-new" as const, title: "Buy", packages: [diyPackage] };
    ai.draftAssessment.mockResolvedValue({
      ...answerDraft,
      options: [buy, ...answerDraft.options],
      notices: [{ kind: "permit-free", certainty: "possible" }],
    });
    const o = await runAssess(caseRequest);
    if (o.type !== "guidance") throw new Error(`expected guidance, got ${o.type}`);
    expect(o.options.map((x) => x.kind)).toEqual(["repair", "buy-new"]);
    expect(o.notices.map((x) => x.kind)).toEqual(["permit-free"]);
  });

  it("carries 'check locally' for a fence case (location-dependent rule)", async () => {
    ai.draftAssessment.mockResolvedValue({
      ...answerDraft,
      notices: [{ kind: "location-dependent-rule", certainty: "applies" }],
    });
    const o = await runAssess(caseRequest);
    if (o.type !== "guidance") throw new Error(`expected guidance, got ${o.type}`);
    expect(o.notices.map((x) => x.kind)).toEqual(["location-dependent-rule"]);
    expect(o.notices[0]!.marks).toContain("check-locally");
  });

  it("carries the tenant notice for a rented property", async () => {
    ai.draftAssessment.mockResolvedValue({
      ...answerDraft,
      notices: [{ kind: "rented-property", certainty: "applies" }],
    });
    const o = await runAssess(caseRequest);
    if (o.type !== "guidance") throw new Error(`expected guidance, got ${o.type}`);
    expect(o.notices.map((x) => x.kind)).toEqual(["rented-property"]);
    expect(o.notices[0]!.text).toContain("landlord");
  });

  it("logs the prompt version and outcome type but no case text", async () => {
    ai.draftAssessment.mockResolvedValue(answerDraft);
    await runAssess(caseRequest);
    const logged = JSON.stringify(vi.mocked(console.info).mock.calls);
    expect(logged).toContain("test-version");
    expect(logged).toContain("guidance");
    expect(logged).not.toContain(caseRequest.description);
  });
});

describe("explainSteps", () => {
  it("gives technical-error for invalid input", async () => {
    expect(notice(await runExplain({})).reason).toBe("technical-error");
    expect(calls()).toBe(0);
  });

  it("returns the checked explanation", async () => {
    ai.draftExplanation.mockResolvedValue({
      steps: [
        { n: 1, basics: "The main valve stops the water." },
        { n: 2, basics: "A spanner turns the nut." },
      ],
    });
    const o = await runExplain(explainRequest);
    expect(o).toMatchObject({ type: "explanation", packageId: "p1" });
  });

  it("gives output-rejected for a malformed draft", async () => {
    ai.draftExplanation.mockResolvedValue({ nope: 1 });
    expect(notice(await runExplain(explainRequest)).reason).toBe("output-rejected");
  });

  it("gives output-rejected for an incomplete draft", async () => {
    ai.draftExplanation.mockResolvedValue({ steps: [{ n: 1, basics: "Only one." }] });
    expect(notice(await runExplain(explainRequest)).reason).toBe("output-rejected");
  });

  it("gives technical-error for an AiError", async () => {
    ai.draftExplanation.mockRejectedValue(new AiError("timeout", "x"));
    expect(notice(await runExplain(explainRequest)).reason).toBe("technical-error");
  });
});

describe("answerStepQuestion", () => {
  it("gives technical-error for invalid input", async () => {
    expect(notice(await runStepQuestion({})).reason).toBe("technical-error");
    expect(calls()).toBe(0);
  });

  it("escalates a hazard in the question with zero AI calls", async () => {
    const o = await runStepQuestion({ ...stepQuestionRequest, question: "I smell gas now." });
    expect(o).toMatchObject({ type: "escalation", escalation: { origin: "precheck" } });
    expect(calls()).toBe(0);
  });

  it("returns the answer", async () => {
    ai.draftStepAnswer.mockResolvedValue({
      answer: "Warm the cap gently.",
      risk: "low",
      hazards: [],
    });
    expect(await runStepQuestion(stepQuestionRequest)).toEqual({
      type: "answer",
      text: "Warm the cap gently.",
    });
  });

  it("gives output-rejected for a malformed draft", async () => {
    ai.draftStepAnswer.mockResolvedValue({ answer: 5 });
    expect(notice(await runStepQuestion(stepQuestionRequest)).reason).toBe("output-rejected");
  });

  it("gives output-rejected for an answer text with a hazard", async () => {
    ai.draftStepAnswer.mockResolvedValue({
      answer: "You will smell gas, keep going.",
      risk: "low",
      hazards: [],
    });
    expect(notice(await runStepQuestion(stepQuestionRequest)).reason).toBe("output-rejected");
  });

  it("escalates a failed draft of high risk", async () => {
    ai.draftStepAnswer.mockResolvedValue({
      answer: "You will smell gas, keep going.",
      risk: "high",
      hazards: [],
    });
    expect((await runStepQuestion(stepQuestionRequest)).type).toBe("escalation");
  });

  it("escalates a clean answer of high risk", async () => {
    ai.draftStepAnswer.mockResolvedValue({ answer: "Stop here.", risk: "high", hazards: [] });
    expect((await runStepQuestion(stepQuestionRequest)).type).toBe("escalation");
  });

  it("gives technical-error for an AiError", async () => {
    ai.draftStepAnswer.mockRejectedValue(new AiError("unavailable", "x"));
    expect(notice(await runStepQuestion(stepQuestionRequest)).reason).toBe("technical-error");
  });
});
