import "fake-indexeddb/auto";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CaseOutcome, CaseRequest } from "../case-model";
import { giveConsent, hasConsent } from "../consent";
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
    await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(1));
    const req: CaseRequest = pipe.assessCase.mock.calls[0]![0].data;
    expect(req.description).toBe("My tap drips");
    expect(req.photos).toBeUndefined();
    await waitFor(() => expect(onStarted).toHaveBeenCalledTimes(1));
  });

  it("does not start with an empty description and names the field", async () => {
    render(<CaseInputScreen />);
    await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
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
    expect(screen.getByText(/after the case, so you can see them again/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(1));
    expect(pipe.assessCase.mock.calls[0]![0].data.photos?.[0]).toMatchObject({
      mediaType: "image/jpeg",
    });
    expect(hasConsent("keep-case-photos")).toBe(false);
  });

  it("shows the chosen photo as a small picture and removes it again", async () => {
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
    render(<CaseInputScreen />);
    await userEvent.upload(
      screen.getByLabelText(/add a photo/i),
      new File(["abc"], "tap.jpg", { type: "image/jpeg" }),
    );
    expect(screen.getByRole("img", { name: "Your photo: tap.jpg" })).toHaveAttribute(
      "src",
      "blob:preview",
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove the photo tap.jpg" }));
    expect(screen.queryByRole("img", { name: /your photo/i })).not.toBeInTheDocument();
  });

  it("takes up to four photos, shows each one and removes just the chosen one", async () => {
    let n = 0;
    URL.createObjectURL = vi.fn(() => `blob:preview-${++n}`);
    URL.revokeObjectURL = vi.fn();
    pipe.assessCase.mockResolvedValue(questions());
    render(<CaseInputScreen />);
    const file = (name: string) => new File([name], name, { type: "image/jpeg" });
    await userEvent.upload(screen.getByLabelText(/add a photo/i), [file("a.jpg"), file("b.jpg")]);
    await userEvent.upload(screen.getByLabelText(/add another photo/i), [
      file("c.jpg"),
      file("d.jpg"),
      file("e.jpg"),
    ]);
    expect(screen.getAllByRole("img", { name: /your photo/i })).toHaveLength(4);
    expect(screen.getByRole("status")).toHaveTextContent(/up to 4 photos/i);
    expect(screen.queryByRole("img", { name: "Your photo: e.jpg" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove the photo b.jpg" }));
    expect(screen.getAllByRole("img", { name: /your photo/i })).toHaveLength(3);
    expect(screen.getByRole("img", { name: "Your photo: a.jpg" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Your photo: b.jpg" })).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/describe/i), "Rust");
    await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(1));
    const req: CaseRequest = pipe.assessCase.mock.calls[0]![0].data;
    expect(req.photos).toHaveLength(3);
  });

  describe("dictation (ITM-268)", () => {
    class FakeRecognition {
      static last: FakeRecognition | undefined;
      lang = "";
      continuous = false;
      interimResults = false;
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      started = false;
      constructor() {
        FakeRecognition.last = this;
      }
      start() {
        this.started = true;
      }
      stop() {
        this.started = false;
        this.onend?.();
      }
      say(text: string) {
        this.onresult?.({
          resultIndex: 0,
          results: [Object.assign([{ transcript: text }], { isFinal: false })],
        });
      }
    }

    afterEach(() => {
      delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
      FakeRecognition.last = undefined;
    });

    it("shows no dictation button where the browser has no speech recognition", () => {
      render(<CaseInputScreen />);
      expect(screen.queryByRole("button", { name: /dictate/i })).not.toBeInTheDocument();
    });

    it("asks for the consent first, then listens and adds the words after the typed text", async () => {
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
      render(<CaseInputScreen />);
      await userEvent.type(screen.getByLabelText(/describe/i), "My tap");
      await userEvent.click(screen.getByRole("button", { name: "Dictate your description" }));
      expect(FakeRecognition.last).toBeUndefined();
      expect(screen.getByText(/may send the audio to its provider/i)).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "I agree" }));
      expect(hasConsent("dictate-with-browser")).toBe(true);
      expect(FakeRecognition.last?.started).toBe(true);
      expect(screen.getByRole("status")).toHaveTextContent("Listening…");
      expect(screen.getByRole("button", { name: "Stop dictating" })).toBeInTheDocument();
      act(() => FakeRecognition.last!.say("drips all night"));
      expect(screen.getByLabelText(/describe/i)).toHaveValue("My tap drips all night");
      await userEvent.click(screen.getByRole("button", { name: "Stop dictating" }));
      expect(screen.queryByText("Listening…")).not.toBeInTheDocument();
    });

    it("opens no microphone when the consent is refused", async () => {
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
      render(<CaseInputScreen />);
      await userEvent.click(screen.getByRole("button", { name: "Dictate your description" }));
      await userEvent.click(screen.getByRole("button", { name: "No, I will type" }));
      expect(FakeRecognition.last).toBeUndefined();
      expect(hasConsent("dictate-with-browser")).toBe(false);
      expect(screen.getByLabelText(/describe/i)).toBeEnabled();
    });

    it("says what to do when the microphone is refused", async () => {
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = FakeRecognition;
      giveConsent("dictate-with-browser");
      render(<CaseInputScreen />);
      await userEvent.click(screen.getByRole("button", { name: "Dictate your description" }));
      act(() => FakeRecognition.last!.onerror?.({ error: "not-allowed" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(/microphone is not allowed/i);
      expect(screen.getByLabelText(/describe/i)).toBeEnabled();
    });
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
    await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
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
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(2));
    const req: CaseRequest = pipe.assessCase.mock.calls[1]![0].data;
    expect(req.answers).toEqual([
      { questionId: "q1", topic: "tap.kind", text: "", notSure: true },
      { questionId: "q2", topic: "tap.age", text: "About 10 years", notSure: false },
    ]);
  });

  it("tells the user when sending the answers fails and lets them send again", async () => {
    const id = await startWithQuestions();
    pipe.assessCase.mockResolvedValueOnce({
      type: "notice",
      notice: { reason: "offline", text: "The AI did not answer in time.", missing: [] },
    });
    render(<QuestionsScreen caseId={id} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The AI did not answer in time.");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });
});
