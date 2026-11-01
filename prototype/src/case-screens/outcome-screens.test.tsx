import "fake-indexeddb/auto";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAFETY_RULES_VERSION } from "../case-model";
import type { CaseOutcome, WorkPackage } from "../case-model";
import { diyPackage } from "../case-pipeline/fixtures";
import { getCase, saveCase, type CaseRecord } from "../history";
import { localStore } from "../local-store";
import { setLevel } from "../profile";

const pipe = vi.hoisted(() => ({
  assessCase: vi.fn(),
  explainSteps: vi.fn(),
  answerStepQuestion: vi.fn(),
}));
vi.mock("../case-pipeline", () => pipe);

let OutcomeScreen: typeof import("./index").OutcomeScreen;
let ExecutionScreen: typeof import("./index").ExecutionScreen;

const pro: WorkPackage = {
  id: "p2",
  title: "Replace the fuse box",
  area: "electrical-devices",
  label: "professional-only",
  reason: "Work on the mains installation.",
  labelUncertain: true,
  decidingInformation: ["Whether the box is an old model"],
  handoverBrief: "Please replace the fuse box.",
  flags: { opensMainsHousing: true, carriesPerson: false, waterRelated: false },
};
const prep: WorkPackage = {
  ...pro,
  id: "p3",
  title: "Clear the wall",
  label: "diy-preparation",
  reason: "Prepare for the electrician.",
  agreeBeforehand: "Agree with the electrician what you clear.",
};
const notRec: WorkPackage = { ...pro, id: "p4", title: "Cut a beam", label: "not-recommended" };

const guidance = (packages: WorkPackage[]): CaseOutcome => ({
  type: "guidance",
  summary: "A tap drips.",
  assumptions: ["The tap is a single lever tap"],
  options: [{ id: "o1", kind: "repair", title: "Repair the tap", packages }],
  notices: [
    {
      kind: "rented-property",
      certainty: "possible",
      text: "Tell your landlord.",
      marks: ["check-locally"],
    },
  ],
  photoAlt: null,
});

function seed(outcome: CaseOutcome | null, patch: Partial<CaseRecord> = {}): string {
  const record: CaseRecord = {
    id: "c1",
    createdAt: "2026-11-01T10:00:00.000Z",
    rulesVersion: SAFETY_RULES_VERSION,
    chosenOffers: {},
    status: "ongoing",
    description: "Tap drips",
    hadPhoto: false,
    answers: [],
    round: 0,
    outcome,
    chosenOptionId: null,
    explanations: { p1: { 1: "A stop valve is the small tap on the pipe." } },
    checked: {},
    notes: "",
    budget: null,
    materialsUsed: [],
    ...patch,
  };
  saveCase(record);
  return record.id;
}

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  ({ OutcomeScreen, ExecutionScreen } = await import("./index"));
});
afterEach(cleanup);

describe("OutcomeScreen", () => {
  it("shows summary, assumptions, options and notices", () => {
    seed(guidance([diyPackage]));
    render(<OutcomeScreen caseId="c1" />);
    expect(screen.getByText("A tap drips.")).toBeInTheDocument();
    expect(screen.getByText(/single lever tap/)).toBeInTheDocument();
    expect(screen.getByText("Repair the tap")).toBeInTheDocument();
    expect(screen.getByText("Tell your landlord.")).toBeInTheDocument();
    expect(screen.getByText(/check locally/i)).toBeInTheDocument();
  });

  it("shows each label with icon and text, and the reason (PACKAGE-LABEL, NOT-COLOR-ALONE)", () => {
    seed(guidance([diyPackage, prep, pro, notRec]));
    render(<OutcomeScreen caseId="c1" />);
    for (const text of [
      "DIY",
      "DIY preparation for a professional",
      "Professional only",
      "Not recommended",
    ]) {
      const badges = screen.getAllByText(text, { selector: "span" });
      expect(badges.length).toBeGreaterThan(0);
      for (const badge of badges) expect(badge.querySelector("svg")).not.toBeNull();
    }
    expect(screen.getByText("Simple work on a tap.")).toBeInTheDocument();
    expect(screen.getAllByText("Work on the mains installation.").length).toBeGreaterThan(0);
  });

  it("names the deciding information and shows the handover brief for professional-only", () => {
    seed(guidance([pro]));
    render(<OutcomeScreen caseId="c1" />);
    expect(screen.getByText(/old model/)).toBeInTheDocument();
    expect(screen.getByText("Please replace the fuse box.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /steps/i })).toBeNull();
  });

  it("copies the brief to the clipboard when sharing is not available", async () => {
    seed(guidance([pro]));
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<OutcomeScreen caseId="c1" />);
    await userEvent.click(screen.getByRole("button", { name: /share/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Please replace the fuse box."));
  });

  it("tells the user to agree preparation with the professional beforehand", () => {
    seed(guidance([prep]));
    render(<OutcomeScreen caseId="c1" />);
    expect(screen.getByText(/Agree with the electrician/)).toBeInTheDocument();
  });

  it("shows an escalation with reason and actions and no steps", () => {
    seed({
      type: "escalation",
      escalation: {
        risk: "critical",
        reason: "You may smell gas.",
        hazards: ["gas"],
        actions: ["Leave the room and open the windows."],
        professionals: ["gas emergency service"],
        origin: "precheck",
      },
    });
    render(<OutcomeScreen caseId="c1" />);
    expect(screen.getByText("You may smell gas.")).toBeInTheDocument();
    expect(screen.getByText(/Leave the room/)).toBeInTheDocument();
    expect(screen.getByText(/gas emergency service/)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /steps/i })).toBeNull();
  });

  it("shows a notice as text", () => {
    seed({
      type: "notice",
      notice: { reason: "offline", text: "You seem to be offline.", missing: [] },
    });
    render(<OutcomeScreen caseId="c1" />);
    expect(screen.getByText("You seem to be offline.")).toBeInTheDocument();
  });

  it("opens the basics for a beginner and keeps them expandable for an experienced user", async () => {
    seed(guidance([diyPackage]));
    const view = render(<OutcomeScreen caseId="c1" />);
    expect(screen.getByText(/small tap on the pipe/)).toBeVisible();
    view.unmount();
    setLevel("plumbing", "experienced");
    render(<OutcomeScreen caseId="c1" />);
    expect(screen.queryByText(/small tap on the pipe/)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /basics/i }));
    expect(screen.getByText(/small tap on the pipe/)).toBeVisible();
  });

  it("shows numbered steps with illustrations that have alt text", () => {
    seed(guidance([diyPackage]));
    render(<OutcomeScreen caseId="c1" />);
    const steps = screen.getByRole("list", { name: /steps/i });
    expect(within(steps).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("img", { name: /stop valve/i })).toBeInTheDocument();
    expect(screen.getByText(/The seal is worn/)).toBeInTheDocument();
    expect(screen.getByText(/Spanner/)).toBeInTheDocument();
    expect(screen.getByText(/10.*20 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/Water may drip/)).toBeInTheDocument();
  });

  it("offers a new assessment when the plan is from older safety rules", async () => {
    seed(guidance([diyPackage]), { rulesVersion: "old" });
    pipe.assessCase.mockResolvedValue({
      type: "notice",
      notice: { reason: "offline", text: "x", missing: [] },
    });
    render(<OutcomeScreen caseId="c1" />);
    expect(screen.getByText(/older safety rules/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /assess again/i }));
    await waitFor(() => expect(pipe.assessCase).toHaveBeenCalledTimes(1));
  });

  it("chooses an option and starts the work", async () => {
    seed(guidance([diyPackage]));
    pipe.explainSteps.mockResolvedValue({
      type: "explanation",
      packageId: "p1",
      steps: [{ n: 2, basics: "b" }],
    });
    const onOpen = vi.fn();
    render(<OutcomeScreen caseId="c1" onOpenPackage={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: /choose this option/i }));
    await waitFor(() => expect(pipe.explainSteps).toHaveBeenCalled());
    expect(getCase("c1")?.chosenOptionId).toBe("o1");
    await userEvent.click(screen.getByRole("button", { name: /start the work/i }));
    expect(onOpen).toHaveBeenCalledWith("p1");
  });
});

describe("ExecutionScreen", () => {
  it("marks the current step and persists a check-off (STEP-CHECK-OFF)", async () => {
    seed(guidance([diyPackage]));
    const view = render(<ExecutionScreen caseId="c1" packageId="p1" />);
    expect(screen.getByText(/current step: 1/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: /step 1/i }));
    expect(getCase("c1")?.checked).toEqual({ p1: [1] });
    expect(screen.getByText(/current step: 2/i)).toBeInTheDocument();
    view.unmount();
    render(<ExecutionScreen caseId="c1" packageId="p1" />);
    expect(screen.getByRole("checkbox", { name: /step 1/i })).toBeChecked();
    await userEvent.click(screen.getByRole("checkbox", { name: /step 1/i }));
    expect(getCase("c1")?.checked).toEqual({ p1: [] });
  });

  it("explains a step again, simpler", async () => {
    seed(guidance([diyPackage]));
    pipe.explainSteps.mockResolvedValue({
      type: "explanation",
      packageId: "p1",
      steps: [{ n: 2, basics: "Simpler words for step two." }],
    });
    render(<ExecutionScreen caseId="c1" packageId="p1" />);
    await userEvent.click(screen.getByRole("button", { name: /explain step 2 again/i }));
    expect(await screen.findByText("Simpler words for step two.")).toBeInTheDocument();
    expect(pipe.explainSteps.mock.calls[0]![0].data).toMatchObject({ onlyStep: 2, simpler: true });
  });

  it("shows the answer to a question in the context of the step", async () => {
    seed(guidance([diyPackage]));
    pipe.answerStepQuestion.mockResolvedValue({ type: "answer", text: "Turn it anticlockwise." });
    render(<ExecutionScreen caseId="c1" packageId="p1" />);
    await userEvent.type(screen.getByLabelText(/question about step 1/i), "Which way?");
    await userEvent.click(screen.getByRole("button", { name: /ask about step 1/i }));
    expect(await screen.findByText("Turn it anticlockwise.")).toBeInTheDocument();
    expect(pipe.answerStepQuestion.mock.calls[0]![0].data).toMatchObject({
      currentStep: 1,
      question: "Which way?",
    });
  });

  it("shows an escalation answer", async () => {
    seed(guidance([diyPackage]));
    pipe.answerStepQuestion.mockResolvedValue({
      type: "escalation",
      escalation: {
        risk: "critical",
        reason: "Gas smell is an emergency.",
        hazards: ["gas"],
        actions: ["Leave the room."],
        professionals: ["gas emergency service"],
        origin: "precheck",
      },
    });
    render(<ExecutionScreen caseId="c1" packageId="p1" />);
    await userEvent.type(screen.getByLabelText(/question about step 1/i), "gas smell");
    await userEvent.click(screen.getByRole("button", { name: /ask about step 1/i }));
    expect(await screen.findByText("Gas smell is an emergency.")).toBeInTheDocument();
  });

  it("shows no steps for a package without a guide", () => {
    seed(guidance([pro]));
    render(<ExecutionScreen caseId="c1" packageId="p2" />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText(/no steps/i)).toBeInTheDocument();
  });
});
