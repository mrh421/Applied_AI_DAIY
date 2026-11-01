import "fake-indexeddb/auto";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AssessmentDraft, CaseOutcome, CaseRequest } from "../case-model";
import { answerDraft, questionsDraft } from "../case-pipeline/fixtures";
import { getCase } from "../history";
import { saveMaterial, saveTool } from "../inventory";
import { localStore } from "../local-store";
import { setLevel } from "../profile";

// ITM-251, ARC-004: MOD-case-session drives MOD-case-pipeline, with the pre-check, the output
// check and the safety enforcement running for real. Only the AI tasks are replaced, by recorded
// drafts. UC-001, UC-002, UC-004, UC-016.
const ai = vi.hoisted(() => ({
  draftAssessment: vi.fn(),
  draftExplanation: vi.fn(),
  draftStepAnswer: vi.fn(),
}));
vi.mock("../ai-tasks", () => ({ ...ai, PROMPT_VERSION: "test-version" }));
vi.mock("../case-pipeline", async () => {
  const { runAssess } = await import("../case-pipeline/assess");
  const { runExplain } = await import("../case-pipeline/explain");
  const { runStepQuestion } = await import("../case-pipeline/step-question");
  return {
    assessCase: ({ data }: { data: unknown }) => runAssess(data),
    explainSteps: ({ data }: { data: unknown }) => runExplain(data),
    answerStepQuestion: ({ data }: { data: unknown }) => runStepQuestion(data),
  };
});
vi.mock("../case-session/photo", async (orig) => ({
  ...(await orig<typeof import("../case-session/photo")>()),
  downscalePhoto: async (f: Blob) => f,
}));

let useCaseSession: typeof import("../case-session").useCaseSession;

const secondRound: AssessmentDraft = {
  ...questionsDraft,
  questions: [{ id: "q2", topic: "tap.colour", text: "What colour?", termExplanations: [] }],
};
const explanation = {
  steps: [
    { n: 1, basics: "A stop valve is the small tap that cuts the water." },
    { n: 2, basics: "Shutting off the water means no water can run while you work." },
    { n: 3, basics: "The seal is the rubber ring in the tap." },
  ],
};
const stepAnswer = { answer: "Turn the cap slowly.", risk: "low", hazards: [] };

const ans = (questionId: string, topic: string, text: string, notSure = false) => ({
  questionId,
  topic,
  text,
  notSure,
});
const requestOf = (call: number): CaseRequest => ai.draftAssessment.mock.calls[call]![0];

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  await localStore.clearAll();
  localStorage.clear();
  ({ useCaseSession } = await import("../case-session"));
});
afterEach(() => vi.restoreAllMocks());

describe("a case from the first description to a guide (UC-001, UC-002)", () => {
  it("two rounds of questions end in a guide", async () => {
    ai.draftAssessment
      .mockResolvedValueOnce(questionsDraft)
      .mockResolvedValueOnce(secondRound)
      .mockResolvedValueOnce(answerDraft);
    const { result } = renderHook(() => useCaseSession());

    await act(() => result.current.start({ description: "The kitchen tap drips." }));
    expect(result.current.session?.record.outcome?.type).toBe("questions");
    expect(result.current.session?.record.round).toBe(1);

    await act(() => result.current.answer([ans("q1", "tap.age", "About five years")]));
    expect(result.current.session?.record.outcome?.type).toBe("questions");
    expect(result.current.session?.record.round).toBe(2);

    await act(() => result.current.answer([ans("q2", "tap.colour", "", true)]));
    const { record } = result.current.session!;
    expect(record.outcome?.type).toBe("guidance");
    expect(requestOf(0).round).toBe(0);
    expect(requestOf(1).round).toBe(1);
    expect(requestOf(2).round).toBe(2);
    expect(requestOf(2).answers.map((a) => a.questionId)).toEqual(["q1", "q2"]);
    expect(getCase(record.id)?.outcome?.type).toBe("guidance");
  });

  it("starts with the description alone: the case holds the description and the stored inventory (UC-001)", async () => {
    saveMaterial({ name: "Seal", amount: 2, unit: "piece" });
    saveTool("Spanner");
    setLevel("plumbing", "experienced");
    ai.draftAssessment.mockResolvedValue(answerDraft);
    const { result } = renderHook(() => useCaseSession());

    await act(() => result.current.start({ description: "The kitchen tap drips." }));

    const { record } = result.current.session!;
    expect(record).toMatchObject({ description: "The kitchen tap drips.", hadPhoto: false });
    expect(record.outcome).not.toBeNull();
    expect(requestOf(0).inventory).toEqual({
      materials: [{ name: "Seal", quantity: { amount: 2, unit: "piece" } }],
      tools: [{ name: "Spanner" }],
    });
    expect(JSON.stringify(requestOf(0))).not.toMatch(/experienced|profile/);
    expect(getCase(record.id)?.description).toBe("The kitchen tap drips.");
  });

  it("holds the optional photo and sends it with the request", async () => {
    ai.draftAssessment.mockResolvedValue(answerDraft);
    const { result } = renderHook(() => useCaseSession());
    const file = new File(["abc"], "tap.jpg", { type: "image/jpeg" });

    await act(() => result.current.start({ description: "The tap drips.", photo: file }));

    expect(result.current.session?.record.hadPhoto).toBe(true);
    expect(result.current.session?.photo).toBeTruthy();
    expect(requestOf(0).photo).toEqual({ mediaType: "image/jpeg", dataBase64: btoa("abc") });
  });
});

describe("safety on the way (UC-002, UC-016)", () => {
  it("a hazard in an answer escalates, and the AI is not asked again", async () => {
    ai.draftAssessment.mockResolvedValueOnce(questionsDraft);
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "The kitchen tap drips." }));

    await act(() => result.current.answer([ans("q1", "tap.age", "I smell gas near the tap.")]));

    expect(result.current.session?.record.outcome?.type).toBe("escalation");
    expect(ai.draftAssessment).toHaveBeenCalledTimes(1);
  });

  it("a hazard in the first description escalates with no AI call at all", async () => {
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "I smell gas in the kitchen." }));
    expect(result.current.session?.record.outcome?.type).toBe("escalation");
    expect(ai.draftAssessment).not.toHaveBeenCalled();
  });

  it("a draft that breaks the rules of the round gives a notice, not an outcome (no questions in round 2)", async () => {
    ai.draftAssessment
      .mockResolvedValueOnce(questionsDraft)
      .mockResolvedValueOnce(secondRound)
      .mockResolvedValueOnce(secondRound);
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "The kitchen tap drips." }));
    await act(() => result.current.answer([ans("q1", "tap.age", "Five years")]));
    let out: CaseOutcome | undefined;
    await act(async () => {
      out = await result.current.answer([ans("q2", "tap.colour", "Chrome")]);
    });
    expect(out?.type).toBe("notice");
  });
});

describe("the work, step by step (UC-004)", () => {
  async function openGuide() {
    ai.draftAssessment.mockResolvedValue(answerDraft);
    ai.draftExplanation.mockResolvedValue(explanation);
    const hook = renderHook(() => useCaseSession());
    await act(() => hook.result.current.start({ description: "The kitchen tap drips." }));
    await act(() => hook.result.current.chooseOption("o1"));
    return hook;
  }

  it("choosing an option explains its steps for the level of the area", async () => {
    const { result } = await openGuide();
    expect(ai.draftExplanation).toHaveBeenCalledTimes(1);
    expect(ai.draftExplanation.mock.calls[0]![0]).toMatchObject({
      packageId: "p1",
      area: "plumbing",
      level: "beginner",
    });
    expect(result.current.session?.record.explanations["p1"]?.[1]).toMatch(/stop valve/);
  });

  it("checked steps are in the history", async () => {
    const { result } = await openGuide();
    const id = result.current.session!.record.id;

    act(() => result.current.checkStep("p1", 1, true));
    act(() => result.current.checkStep("p1", 2, true));

    expect(result.current.session?.record.checked).toEqual({ p1: [1, 2] });
    expect(getCase(id)?.checked).toEqual({ p1: [1, 2] });

    act(() => result.current.checkStep("p1", 2, false));
    expect(getCase(id)?.checked).toEqual({ p1: [1] });
  });

  it("a question about a step gets a checked answer; a hazard in it escalates", async () => {
    const { result } = await openGuide();
    ai.draftStepAnswer.mockResolvedValueOnce(stepAnswer);

    let out = await act(() => result.current.askStep("p1", 2, "The cap is stuck."));
    expect(out).toMatchObject({ type: "answer" });

    ai.draftStepAnswer.mockClear();
    out = await act(() => result.current.askStep("p1", 2, "I smell gas, what now?"));
    expect(out.type).toBe("escalation");
    expect(ai.draftStepAnswer).not.toHaveBeenCalled();
  });

  it("explains a step again, simpler", async () => {
    const { result } = await openGuide();
    ai.draftExplanation.mockResolvedValueOnce({
      steps: [{ n: 2, basics: "The seal is a small rubber ring." }],
    });

    await act(() => result.current.reExplain("p1", 2));

    expect(ai.draftExplanation.mock.calls.at(-1)![0]).toMatchObject({ onlyStep: 2, simpler: true });
    expect(result.current.session?.record.explanations["p1"]?.[2]).toMatch(/rubber ring/);
  });
});
