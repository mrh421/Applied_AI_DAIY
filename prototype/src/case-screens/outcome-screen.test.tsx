// Level: component
// Module: MOD-case-screens

import "fake-indexeddb/auto";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CaseOutcome, WorkPackage } from "../case-model";
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
let OutcomeScreen: typeof import("./index").OutcomeScreen;
let setLevel: typeof import("../profile").setLevel;

const pkg: WorkPackage = {
  id: "p1",
  title: "Replace the tap cartridge",
  area: "plumbing",
  label: "diy",
  reason: "Simple part swap.",
  labelUncertain: false,
  decidingInformation: [],
  handoverBrief: "Brief",
  flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: true },
  guide: {
    diagnosis: "The cartridge seal is worn.",
    tools: [{ id: "t1", name: "Adjustable spanner", rentable: false }],
    materials: [
      {
        id: "m1",
        name: "Ceramic cartridge",
        quantity: { amount: 1, unit: "piece" },
        spec: {},
        replacementPart: true,
        safetyCritical: "no",
        printable: false,
      },
    ],
    steps: [
      {
        n: 1,
        text: "Close the stop valve.",
        opensDevice: false,
        switchesOffCircuit: false,
        fixedSafetyStep: true,
        imageIds: ["water-shut-off-valve"],
      },
      {
        n: 2,
        text: "Unscrew the handle.",
        opensDevice: false,
        switchesOffCircuit: false,
        fixedSafetyStep: false,
        imageIds: [],
      },
    ],
    estimatedMinutes: { min: 30, max: 45 },
    warnings: ["Water may still drip from the pipe."],
  },
};

const guidance: CaseOutcome = {
  type: "guidance",
  summary: "Your tap drips because of a worn seal.",
  assumptions: ["The tap is a single-lever mixer."],
  options: [{ id: "o1", kind: "repair", title: "Repair the tap", packages: [pkg] }],
  notices: [],
  photoAlt: null,
};

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  pipe.explainSteps.mockResolvedValue({
    type: "explanation",
    packageId: "p1",
    steps: [
      { n: 1, basics: "A stop valve is the small tap on the pipe." },
      { n: 2, basics: "Turn the handle screw anticlockwise." },
    ],
  });
  ({ CaseInputScreen, OutcomeScreen } = await import("./index"));
  ({ setLevel } = await import("../profile"));
});
afterEach(cleanup);

async function startWith(outcome: CaseOutcome) {
  pipe.assessCase.mockResolvedValueOnce(outcome);
  let id = "";
  const view = render(<CaseInputScreen onStarted={(i) => (id = i)} />);
  await userEvent.type(screen.getByLabelText(/describe/i), "Tap drips");
  await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
  await waitFor(() => expect(id).not.toBe(""));
  view.unmount();
  return id;
}

describe("OutcomeScreen guidance", () => {
  // TST-080 · level: component · module: MOD-case-screens
  // guards: PROBLEM-SUMMARY; INSTRUCTION-STRUCTURE
  // given: a case whose outcome is a guide with summary, assumptions, cause, tools, materials, duration and a warning
  // input: the outcome screen is opened
  // expect: the summary, the assumptions, the cause, a tool, a material, the duration and the warning are all shown
  it("shows the summary, the assumptions and all parts of the guide (PROBLEM-SUMMARY, INSTRUCTION-STRUCTURE)", async () => {
    const id = await startWith(guidance);
    render(<OutcomeScreen caseId={id} />);
    expect(screen.getByText("Your tap drips because of a worn seal.")).toBeInTheDocument();
    expect(screen.getByText("The tap is a single-lever mixer.")).toBeInTheDocument();
    expect(screen.getByText("The cartridge seal is worn.")).toBeInTheDocument();
    expect(screen.getByText("Adjustable spanner")).toBeInTheDocument();
    expect(screen.getByText(/Ceramic cartridge/)).toBeInTheDocument();
    expect(screen.getByText(/30.*45 minutes/)).toBeInTheDocument();
    expect(screen.getByText("Water may still drip from the pipe.")).toBeInTheDocument();
  });

  it("shows the estimated cost of the option, a range when the AI estimated the prices", async () => {
    const priced = {
      ...guidance,
      options: [
        {
          id: "o1",
          kind: "repair" as const,
          title: "Repair the tap",
          packages: [
            {
              ...pkg,
              guide: {
                ...pkg.guide!,
                materials: [{ ...pkg.guide!.materials[0]!, estimatedPrice: { min: 12, max: 25 } }],
              },
            },
          ],
        },
      ],
    } as CaseOutcome;
    const id = await startWith(priced);
    render(<OutcomeScreen caseId={id} />);
    expect(screen.getByTestId("cost-summary")).toHaveTextContent(
      "Materials: about 12 EUR to 25 EUR (an estimate, please check the prices)",
    );
  });

  it("says that prices are unknown when there is neither an offer nor an estimate", async () => {
    const id = await startWith(guidance);
    render(<OutcomeScreen caseId={id} />);
    expect(screen.getByTestId("cost-summary")).toHaveTextContent("some prices are unknown");
  });

  // TST-081 · level: component · module: MOD-case-screens
  // guards: NUMBERED-STEPS
  // given: a case whose outcome is a guide
  // input: the outcome screen is opened
  // expect: the steps stand in an ordered list, in their order
  it("numbers the steps (NUMBERED-STEPS)", async () => {
    const id = await startWith(guidance);
    render(<OutcomeScreen caseId={id} />);
    const list = screen.getByRole("list", { name: /steps/i });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Close the stop valve.");
    expect(items[1]).toHaveTextContent("Unscrew the handle.");
  });

  // TST-082 · level: component · module: MOD-case-screens
  // guards: ILLUSTRATIVE-IMAGES; TEXT-ALTERNATIVES
  // given: a guide whose step names an illustration
  // input: the outcome screen is opened
  // expect: an image is shown whose accessible name describes it (a stop valve on a pipe)
  it("shows an illustration with its text alternative (ILLUSTRATIVE-IMAGES, TEXT-ALTERNATIVES)", async () => {
    const id = await startWith(guidance);
    render(<OutcomeScreen caseId={id} />);
    expect(screen.getByRole("img", { name: /stop valve on a pipe/i })).toBeInTheDocument();
  });

  // TST-083 · level: component · module: MOD-case-screens
  // guards: BASICS-EXPANDABLE
  // given: a person at the skill level beginner
  // input: the outcome screen is opened
  // expect: the explanation of the basics is shown open, and it was requested for the level beginner
  it("opens the basics for a beginner (BASICS-EXPANDABLE)", async () => {
    const id = await startWith(guidance);
    render(<OutcomeScreen caseId={id} />);
    expect(
      await screen.findByText("A stop valve is the small tap on the pipe."),
    ).toBeInTheDocument();
    expect(pipe.explainSteps.mock.calls[0]![0].data).toMatchObject({ level: "beginner" });
  });

  // TST-084 · level: component · module: MOD-case-screens
  // guards: BASICS-EXPANDABLE
  // given: a person whose plumbing level is experienced
  // input: the outcome screen is opened and the basics are expanded
  // expect: the basics are hidden at first and shown after expanding
  it("collapses the basics for an experienced user and lets them expand (BASICS-EXPANDABLE)", async () => {
    setLevel("plumbing", "experienced");
    const id = await startWith(guidance);
    render(<OutcomeScreen caseId={id} />);
    const toggles = await screen.findAllByRole("button", { name: /basics/i });
    expect(screen.queryByText("A stop valve is the small tap on the pipe.")).toBeNull();
    await userEvent.click(toggles[0]!);
    expect(screen.getByText("A stop valve is the small tap on the pipe.")).toBeInTheDocument();
  });

  it("says so when the explanations are not available and still shows the steps", async () => {
    pipe.explainSteps.mockRejectedValue(new Error("down"));
    const id = await startWith(guidance);
    render(<OutcomeScreen caseId={id} />);
    expect(await screen.findByText(/explanations are not available/i)).toBeInTheDocument();
    expect(screen.getByText("Close the stop valve.")).toBeInTheDocument();
  });
});

describe("OutcomeScreen escalation and notice", () => {
  // TST-065 · level: component · module: MOD-case-screens
  // guards: ESCALATION-REASON; HAZARD-PROFESSIONAL; NO-GUIDE-FOR-HAZARDS
  // given: a case whose outcome is a critical escalation for gas with an action and a professional
  // input: the outcome screen is opened
  // expect: risk, reason, action and professional are shown, no list of steps appears, and no explanation of steps is requested
  it("shows risk, reason, actions and professional and no steps (ESCALATION-REASON, HAZARD-PROFESSIONAL)", async () => {
    const id = await startWith({
      type: "escalation",
      escalation: {
        risk: "critical",
        reason: "Gas can explode.",
        hazards: ["gas"],
        actions: ["Leave the room and open the windows."],
        professionals: ["Gas installer"],
        origin: "precheck",
      },
    });
    render(<OutcomeScreen caseId={id} />);
    expect(screen.getByText(/critical/i)).toBeInTheDocument();
    expect(screen.getByText("Gas can explode.")).toBeInTheDocument();
    expect(screen.getByText("Leave the room and open the windows.")).toBeInTheDocument();
    expect(screen.getByText("Gas installer")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /steps/i })).toBeNull();
    expect(pipe.explainSteps).not.toHaveBeenCalled();
  });

  // TST-066 · level: component · module: MOD-case-screens
  // guards: UNDERSTANDABLE-ERROR-NOTICE
  // given: an assessment that fails with a notice that the person seems to be offline
  // input: the person types a description and presses Find my repair
  // expect: the notice text is shown on the input screen and the case does not move on
  it("shows the notice of a failed assessment on the case input and does not move on (UNDERSTANDABLE-ERROR-NOTICE)", async () => {
    pipe.assessCase.mockResolvedValueOnce({
      type: "notice",
      notice: { reason: "offline", text: "You seem to be offline.", missing: [] },
    });
    const onStarted = vi.fn();
    render(<CaseInputScreen onStarted={onStarted} />);
    await userEvent.type(screen.getByLabelText(/describe/i), "Tap drips");
    await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
    expect(await screen.findByText("You seem to be offline.")).toBeInTheDocument();
    expect(onStarted).not.toHaveBeenCalled();
  });

  it("says so when the case has no outcome", () => {
    render(<OutcomeScreen caseId="unknown" />);
    expect(screen.getByText(/no result/i)).toBeInTheDocument();
  });
});
