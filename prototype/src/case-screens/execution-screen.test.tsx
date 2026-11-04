// Level: component
// Module: MOD-case-screens

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
