import "fake-indexeddb/auto";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAFETY_RULES_VERSION } from "../case-model";
import type { CaseOutcome, CaseRequest, ExplainRequest } from "../case-model";
import { diyPackage } from "../case-pipeline/fixtures";
import { getCase, saveCase, type CaseRecord } from "../history";
import { listMaterials, saveMaterial } from "../inventory";
import { localStore } from "../local-store";
import { setLevel } from "../profile";

const pipe = vi.hoisted(() => ({
  assessCase: vi.fn(),
  explainSteps: vi.fn(),
  answerStepQuestion: vi.fn(),
}));
vi.mock("../case-pipeline", () => pipe);
vi.mock("./photo", async (orig) => ({
  ...(await orig<typeof import("./photo")>()),
  downscalePhoto: async (f: Blob) => f,
}));

let useCaseSession: typeof import("./index").useCaseSession;

const questions = (round: 1 | 2, topic = "tap.age", id = "q1"): CaseOutcome => ({
  type: "questions",
  round,
  missing: [],
  questions: [{ id, topic, text: "?", termExplanations: [] }],
});
const guidance: CaseOutcome = {
  type: "guidance",
  summary: "A tap drips.",
  assumptions: [],
  options: [{ id: "o1", kind: "repair", title: "Repair", packages: [diyPackage] }],
  notices: [],
  photoAlt: null,
};
const ans = (questionId: string, topic: string, text: string, notSure = false) => ({
  questionId,
  topic,
  text,
  notSure,
});
// A server function is called as fn({ data }).
const reqOf = (call: number): CaseRequest => pipe.assessCase.mock.calls[call][0].data;

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  ({ useCaseSession } = await import("./index"));
});
afterEach(() => vi.restoreAllMocks());

describe("start and answer", () => {
  it("sends description, answers, round 0 and the inventory snapshot, and no profile", async () => {
    saveMaterial({ name: "Seal", amount: 2, unit: "piece" });
    setLevel("plumbing", "experienced");
    pipe.assessCase.mockResolvedValue(guidance);
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap drips" }));
    const req = reqOf(0);
    expect(req).toMatchObject({ description: "Tap drips", answers: [], round: 0 });
    expect(req.inventory.materials).toEqual([
      { name: "Seal", quantity: { amount: 2, unit: "piece" } },
    ]);
    expect(JSON.stringify(req)).not.toMatch(/experienced|level|profile/);
    expect(result.current.session?.record.outcome).toEqual(guidance);
    expect(result.current.session?.record.rulesVersion).toBe(SAFETY_RULES_VERSION);
  });

  it("sends the photo with the request and holds it", async () => {
    pipe.assessCase.mockResolvedValue(guidance);
    const { result } = renderHook(() => useCaseSession());
    const file = new File(["abc"], "p.jpg", { type: "image/jpeg" });
    await act(() => result.current.start({ description: "Tap", photo: file }));
    expect(reqOf(0).photo).toEqual({ mediaType: "image/jpeg", dataBase64: btoa("abc") });
    expect(result.current.session?.photo).toBeTruthy();
    expect(result.current.session?.record.hadPhoto).toBe(true);
  });

  it("advances the round from the questions outcome; no third round", async () => {
    pipe.assessCase
      .mockResolvedValueOnce(questions(1))
      .mockResolvedValueOnce(questions(2, "tap.colour", "q2"))
      .mockResolvedValueOnce(guidance);
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap" }));
    expect(result.current.session?.record.round).toBe(1);
    await act(() => result.current.answer([ans("q1", "tap.age", "5 years")]));
    expect(reqOf(1).round).toBe(1);
    expect(result.current.session?.record.round).toBe(2);
    await act(() => result.current.answer([ans("q2", "tap.colour", "", true)]));
    expect(reqOf(2).round).toBe(2);
    expect(reqOf(2).answers).toHaveLength(2);
    expect(result.current.session?.record.outcome?.type).toBe("guidance");
    expect(pipe.assessCase).toHaveBeenCalledTimes(3);
  });

  it("prefills later questions by topic and drops questions answered 'not sure'", async () => {
    pipe.assessCase.mockResolvedValueOnce(questions(1)).mockResolvedValueOnce({
      type: "questions",
      round: 2,
      missing: [],
      questions: [
        { id: "q2", topic: "tap.age", text: "?", termExplanations: [] },
        { id: "q3", topic: "tap.colour", text: "?", termExplanations: [] },
      ],
    });
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap" }));
    let out: CaseOutcome | undefined;
    await act(async () => {
      out = await result.current.answer([
        ans("q1", "tap.age", "5 years"),
        ans("qx", "tap.colour", "", true),
      ]);
    });
    if (out?.type !== "questions") throw new Error("expected questions");
    expect(out.questions.map((q) => q.id)).toEqual(["q2"]);
    expect(out.questions[0].prefill).toBe("5 years");
  });

  it("gives an offline notice for a network failure, without throwing", async () => {
    pipe.assessCase.mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useCaseSession());
    let out: CaseOutcome | undefined;
    await act(async () => {
      out = await result.current.start({ description: "Tap" });
    });
    expect(out).toMatchObject({ type: "notice", notice: { reason: "offline" } });
  });

  it("gives technical-error for another failure", async () => {
    pipe.assessCase.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCaseSession());
    let out: CaseOutcome | undefined;
    await act(async () => {
      out = await result.current.start({ description: "Tap" });
    });
    expect(out).toMatchObject({ type: "notice", notice: { reason: "technical-error" } });
  });
});

describe("open store (GO-BACK) and history", () => {
  it("keeps the session with its photo across unmount and remount", async () => {
    pipe.assessCase.mockResolvedValue(guidance);
    const first = renderHook(() => useCaseSession());
    await act(() =>
      first.result.current.start({
        description: "Tap",
        photo: new File(["abc"], "p.jpg", { type: "image/jpeg" }),
      }),
    );
    const id = first.result.current.session!.record.id;
    first.unmount();
    const second = renderHook(() => useCaseSession(id));
    expect(second.result.current.session?.record.description).toBe("Tap");
    expect(second.result.current.session?.photo).toBeTruthy();
  });

  it("saves the record after every change and a check-off survives a reload", async () => {
    pipe.assessCase.mockResolvedValue(guidance);
    const first = renderHook(() => useCaseSession());
    await act(() => first.result.current.start({ description: "Tap" }));
    const id = first.result.current.session!.record.id;
    act(() => first.result.current.checkStep("p1", 1, true));
    act(() => first.result.current.checkStep("p1", 2, true));
    act(() => first.result.current.checkStep("p1", 2, false));
    act(() => first.result.current.setNotes("hello"));
    act(() => first.result.current.setBudget({ amount: 20, currency: "EUR" }));
    act(() => first.result.current.setChosenOffer("m1", "offer-1"));
    expect(getCase(id)).toMatchObject({
      checked: { p1: [1] },
      notes: "hello",
      budget: { amount: 20, currency: "EUR" },
      chosenOffers: { m1: "offer-1" },
    });
    first.unmount();

    // A reload: the module-level store is gone, localStorage stays.
    vi.resetModules();
    const fresh = (await import("./index")).useCaseSession;
    const second = renderHook(() => fresh(id));
    expect(second.result.current.session?.record.checked).toEqual({ p1: [1] });
  });
});

describe("explanations", () => {
  const explanation = (steps = [1, 2]) => ({
    type: "explanation",
    packageId: "p1",
    steps: steps.map((n) => ({ n, basics: `basics ${n}` })),
  });

  it("chooseOption requests the DIY packages' explanations at the area's level", async () => {
    setLevel("plumbing", "some-experience");
    pipe.assessCase.mockResolvedValue(guidance);
    pipe.explainSteps.mockResolvedValue(explanation());
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap" }));
    await act(() => result.current.chooseOption("o1"));
    const req: ExplainRequest = pipe.explainSteps.mock.calls[0][0].data;
    expect(req).toMatchObject({
      packageId: "p1",
      area: "plumbing",
      level: "some-experience",
      onlyStep: null,
      simpler: false,
    });
    expect(req.steps.map((s) => s.n)).toEqual([1, 2]);
    const r = result.current.session!.record;
    expect(r.chosenOptionId).toBe("o1");
    expect(r.explanations.p1[2]).toBe("basics 2");
  });

  it("sends beginner when no level is set", async () => {
    pipe.assessCase.mockResolvedValue(guidance);
    pipe.explainSteps.mockResolvedValue(explanation());
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap" }));
    await act(() => result.current.chooseOption("o1"));
    expect(pipe.explainSteps.mock.calls[0][0].data.level).toBe("beginner");
  });

  it("reExplain asks for one step, simpler", async () => {
    pipe.assessCase.mockResolvedValue(guidance);
    pipe.explainSteps.mockResolvedValue(explanation([2]));
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap" }));
    await act(() => result.current.reExplain("p1", 2));
    expect(pipe.explainSteps.mock.calls[0][0].data).toMatchObject({
      onlyStep: 2,
      simpler: true,
      level: "beginner",
    });
    expect(result.current.session!.record.explanations.p1[2]).toBe("basics 2");
  });

  it("keeps the steps when an explanation fails (offline notice)", async () => {
    pipe.assessCase.mockResolvedValue(guidance);
    pipe.explainSteps.mockRejectedValue(new TypeError("offline"));
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap" }));
    let out: unknown;
    await act(async () => {
      out = await result.current.reExplain("p1", 1);
    });
    expect(out).toMatchObject({ type: "notice", notice: { reason: "offline" } });
    expect(result.current.session!.record.outcome).toEqual(guidance);
  });

  it("askStep sends the summary, package, step and question", async () => {
    pipe.assessCase.mockResolvedValue(guidance);
    pipe.answerStepQuestion.mockResolvedValue({ type: "answer", text: "Use oil." });
    const { result } = renderHook(() => useCaseSession());
    await act(() => result.current.start({ description: "Tap" }));
    let out: unknown;
    await act(async () => {
      out = await result.current.askStep("p1", 2, "Stuck?");
    });
    expect(out).toEqual({ type: "answer", text: "Use oil." });
    expect(pipe.answerStepQuestion.mock.calls[0][0].data).toMatchObject({
      summary: "A tap drips.",
      currentStep: 2,
      question: "Stuck?",
      pkg: { id: "p1" },
    });
  });
});

describe("older safety rules (ARC-002)", () => {
  const stale = (over: Partial<CaseRecord> = {}): CaseRecord => ({
    id: "old",
    createdAt: "2026-01-01T00:00:00Z",
    rulesVersion: "older",
    chosenOffers: {},
    status: "ongoing",
    description: "Tap drips",
    hadPhoto: false,
    answers: [],
    round: 0,
    outcome: guidance,
    chosenOptionId: null,
    explanations: {},
    checked: {},
    notes: "",
    budget: null,
    materialsUsed: [],
    ...over,
  });

  it("sets staleRules and offers reassess, which stores the new version", async () => {
    saveCase(stale());
    pipe.assessCase.mockResolvedValue(guidance);
    const { result } = renderHook(() => useCaseSession("old"));
    expect(result.current.session?.staleRules).toBe(true);
    expect(result.current.session?.record.outcome).toEqual(guidance);
    await act(() => result.current.reassess());
    expect(reqOf(0).description).toBe("Tap drips");
    expect(result.current.session?.staleRules).toBe(false);
    expect(getCase("old")?.rulesVersion).toBe(SAFETY_RULES_VERSION);
  });

  it("replaces the outcome by an escalation when the pre-check hits the stored case", () => {
    saveCase(stale({ description: "I smell gas in the kitchen." }));
    const { result } = renderHook(() => useCaseSession("old"));
    expect(result.current.session?.record.outcome?.type).toBe("escalation");
    expect(pipe.assessCase).not.toHaveBeenCalled();
  });

  it("does not flag a record of the current version", () => {
    saveCase(stale({ rulesVersion: SAFETY_RULES_VERSION }));
    const { result } = renderHook(() => useCaseSession("old"));
    expect(result.current.session?.staleRules).toBe(false);
  });
});

describe("complete (UC-015)", () => {
  async function started() {
    const saved = saveMaterial({ name: "Seal", amount: 5, unit: "piece" });
    if (!saved.ok) throw new Error("setup");
    pipe.assessCase.mockResolvedValue(guidance);
    const hook = renderHook(() => useCaseSession());
    await act(() => hook.result.current.start({ description: "Tap" }));
    return { hook, itemId: saved.item.id };
  }

  it("deducts, stores materialsUsed and sets the status", async () => {
    const { hook, itemId } = await started();
    const used = [
      { name: "Seal", quantity: { amount: 2, unit: "piece" as const }, inventoryItemId: itemId },
    ];
    let res: unknown;
    act(() => {
      res = hook.result.current.complete(used);
    });
    expect(res).toEqual({ ok: true });
    expect(listMaterials()[0].quantity.amount).toBe(3);
    expect(hook.result.current.session!.record).toMatchObject({
      status: "completed",
      materialsUsed: used,
    });
  });

  it("undoes the deduction and reports storage-full when the record cannot be saved", async () => {
    const { hook, itemId } = await started();
    // The session module and this spy must share one module registry (see beforeEach).
    const fresh = await import("../local-store");
    const put = fresh.localStore.put.bind(fresh.localStore);
    vi.spyOn(fresh.localStore, "put").mockImplementation((c, id, data) => {
      if (c === "cases") throw new fresh.StorageFullError();
      return put(c, id, data);
    });
    let res: unknown;
    act(() => {
      res = hook.result.current.complete([
        { name: "Seal", quantity: { amount: 2, unit: "piece" }, inventoryItemId: itemId },
      ]);
    });
    expect(res).toEqual({ ok: false, reason: "storage-full" });
    expect(listMaterials()[0].quantity.amount).toBe(5);
    expect(hook.result.current.session!.record.status).toBe("ongoing");
  });
});
