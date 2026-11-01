import "fake-indexeddb/auto";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CaseOutcome, CaseRequest } from "../case-model";
import { hasConsent } from "../consent";
import { localStore } from "../local-store";

const pipe = vi.hoisted(() => ({
  assessCase: vi.fn(),
  explainSteps: vi.fn(),
  answerStepQuestion: vi.fn(),
}));
vi.mock("../case-pipeline", () => pipe);
vi.mock("../case-session/photo", async (orig) => ({
  ...(await orig<typeof import("../case-session/photo")>()),
  downscalePhoto: async (f: Blob) => f,
}));

let CaseInputScreen: typeof import("./index").CaseInputScreen;
let QuestionsScreen: typeof import("./index").QuestionsScreen;

const questions = (): CaseOutcome => ({
  type: "questions",
  round: 1,
  missing: [],
  questions: [
    {
      id: "q1",
      topic: "tap.kind",
      text: "What kind of tap is it?",
      termExplanations: [{ term: "cartridge", explanation: "the part inside the handle" }],
    },
    {
      id: "q2",
      topic: "tap.age",
      text: "How old is the tap?",
      termExplanations: [],
      prefill: "About 10 years",
    },
  ],
});

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  ({ CaseInputScreen, QuestionsScreen } = await import("./index"));
});
afterEach(cleanup);

describe("CaseInputScreen", () => {
  it("shows the AI notice and the privacy notice before any request (AI-INTERACTION-DISCLOSED)", () => {
    render(<CaseInputScreen />);
    expect(screen.getByText(/AI system/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
    expect(pipe.assessCase).not.toHaveBeenCalled();
  });

  it("starts a case with the text alone and Confirm (THREE-STEP-START, OPTIONAL-PHOTO)", async () => {
    pipe.assessCase.mockResolvedValue(questions());
    const onStarted = vi.fn();
    render(<CaseInputScreen onStarted={onStarted} />);
    await userEvent.type(screen.getByLabelText(/describe/i), "My tap drips");
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(1));
    const req: CaseRequest = pipe.assessCase.mock.calls[0]![0].data;
    expect(req.description).toBe("My tap drips");
    expect(req.photo).toBeUndefined();
    await waitFor(() => expect(onStarted).toHaveBeenCalledTimes(1));
  });

  it("does not start with an empty description and names the field", async () => {
    render(<CaseInputScreen />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(pipe.assessCase).not.toHaveBeenCalled();
    expect(screen.getByText(/describe.*:/i)).toBeInTheDocument();
  });

  it("accepts a photo and asks for the consent in one action; leaving it blocks nothing", async () => {
    pipe.assessCase.mockResolvedValue(questions());
    render(<CaseInputScreen />);
    await userEvent.type(screen.getByLabelText(/describe/i), "Tap");
    await userEvent.upload(
      screen.getByLabelText(/photo/i),
      new File(["abc"], "p.jpg", { type: "image/jpeg" }),
    );
    expect(screen.getByText(/after the case, so you can see it again/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(1));
    expect(pipe.assessCase.mock.calls[0]![0].data.photo).toMatchObject({
      mediaType: "image/jpeg",
    });
    expect(hasConsent("keep-case-photos")).toBe(false);
  });

  it("gives the consent with one action", async () => {
    render(<CaseInputScreen />);
    await userEvent.upload(
      screen.getByLabelText(/photo/i),
      new File(["abc"], "p.jpg", { type: "image/jpeg" }),
    );
    await userEvent.click(screen.getByRole("button", { name: /keep the photo/i }));
    expect(hasConsent("keep-case-photos")).toBe(true);
  });
});

describe("QuestionsScreen", () => {
  async function startWithQuestions() {
    pipe.assessCase.mockResolvedValueOnce(questions());
    let id = "";
    const view = render(<CaseInputScreen onStarted={(i) => (id = i)} />);
    await userEvent.type(screen.getByLabelText(/describe/i), "Tap drips");
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(id).not.toBe(""));
    view.unmount();
    return id;
  }

  it("shows questions, term explanations and a prefilled answer", async () => {
    const id = await startWithQuestions();
    render(<QuestionsScreen caseId={id} />);
    expect(screen.getByLabelText("What kind of tap is it?")).toHaveValue("");
    expect(screen.getByText(/cartridge/)).toBeInTheDocument();
    expect(screen.getByText(/the part inside the handle/)).toBeInTheDocument();
    expect(screen.getByLabelText("How old is the tap?")).toHaveValue("About 10 years");
  });

  it("sends confirmed, changed and not-sure answers (REDUNDANT-ENTRY)", async () => {
    const id = await startWithQuestions();
    pipe.assessCase.mockResolvedValueOnce({
      type: "notice",
      notice: { reason: "offline", text: "x", missing: [] },
    });
    render(<QuestionsScreen caseId={id} />);
    await userEvent.click(screen.getAllByRole("checkbox", { name: /not sure/i })[0]!);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(2));
    const req: CaseRequest = pipe.assessCase.mock.calls[1]![0].data;
    expect(req.answers).toEqual([
      { questionId: "q1", topic: "tap.kind", text: "", notSure: true },
      { questionId: "q2", topic: "tap.age", text: "About 10 years", notSure: false },
    ]);
  });
});
