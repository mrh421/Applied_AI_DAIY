// Level: component
// Module: MOD-case-screens

import "fake-indexeddb/auto";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CaseOutcome, PackageLabel, WorkPackage } from "../case-model";
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

const flags = { opensMainsHousing: false, carriesPerson: false, waterRelated: false };
const pkg = (id: string, label: PackageLabel, extra: Partial<WorkPackage> = {}): WorkPackage => ({
  id,
  title: `Package ${id}`,
  area: "plumbing",
  label,
  reason: `Reason for ${id}`,
  labelUncertain: false,
  decidingInformation: [],
  handoverBrief: `Brief for ${id}`,
  flags,
  ...extra,
});

const guidance = (): CaseOutcome => ({
  type: "guidance",
  summary: "The tap drips because of a worn washer.",
  assumptions: ["The tap is a standard one"],
  notices: [],
  photoAlt: null,
  options: [
    {
      id: "o1",
      kind: "repair",
      title: "Repair it",
      packages: [
        pkg("a", "diy"),
        pkg("b", "diy-preparation", {
          agreeBeforehand: "Agree the prep with your electrician first.",
        }),
        pkg("c", "professional-only", {
          labelUncertain: true,
          decidingInformation: ["Is the pipe copper?"],
        }),
        pkg("d", "not-recommended"),
      ],
    },
  ],
});

async function openOutcome() {
  pipe.assessCase.mockResolvedValueOnce(guidance());
  let id = "";
  const view = render(<CaseInputScreen onStarted={(i) => (id = i)} />);
  await userEvent.type(screen.getByLabelText(/describe/i), "Tap drips");
  await userEvent.click(screen.getByRole("button", { name: "Find my repair" }));
  await waitFor(() => expect(id).not.toBe(""));
  view.unmount();
  return id;
}

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  ({ CaseInputScreen, OutcomeScreen } = await import("./index"));
});
afterEach(cleanup);

describe("OutcomeScreen packages", () => {
  it("shows summary and assumptions", async () => {
    render(<OutcomeScreen caseId={await openOutcome()} />);
    expect(screen.getByText(/worn washer/)).toBeInTheDocument();
    expect(screen.getByText(/standard one/)).toBeInTheDocument();
  });

  // TST-063 · level: component · module: MOD-case-screens
  // guards: PACKAGE-LABEL; PACKAGE-REASON
  // given: an outcome with four packages labelled DIY, DIY preparation for a professional, professional only and not recommended
  // input: the outcome screen is opened
  // expect: each package shows its label as text and the reason given for it
  it("shows each label as text with its reason (PACKAGE-LABEL, PACKAGE-REASON)", async () => {
    render(<OutcomeScreen caseId={await openOutcome()} />);
    for (const [id, text] of [
      ["a", "DIY"],
      ["b", "DIY preparation for a professional"],
      ["c", "Professional only"],
      ["d", "Not recommended"],
    ] as const) {
      const section = screen.getByRole("group", { name: `Package ${id}` });
      expect(within(section).getByText(text)).toBeInTheDocument();
      expect(within(section).getByText(`Reason for ${id}`)).toBeInTheDocument();
    }
  });

  it("shows the information that would change an uncertain label", async () => {
    render(<OutcomeScreen caseId={await openOutcome()} />);
    expect(screen.getByText(/Is the pipe copper\?/)).toBeInTheDocument();
  });

  // TST-064 · level: component · module: MOD-case-screens
  // guards: HANDOVER-BRIEF
  // given: an outcome with a professional-only package and a DIY package, the browser without a share function
  // input: the outcome screen is opened and the copy button of the professional-only package is pressed
  // expect: the brief of that package is shown and copied to the clipboard, and the DIY package shows no brief
  it("gives a professional-only package a brief to copy (HANDOVER-BRIEF)", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    render(<OutcomeScreen caseId={await openOutcome()} />);
    const section = screen.getByRole("group", { name: "Package c" });
    expect(within(section).getByText("Brief for c")).toBeInTheDocument();
    await userEvent.click(within(section).getByRole("button", { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith("Brief for c");
    expect(
      within(screen.getByRole("group", { name: "Package a" })).queryByText(/Brief for/),
    ).toBeNull();
  });

  it("shares the brief with the Web Share API where it exists", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    render(<OutcomeScreen caseId={await openOutcome()} />);
    const section = screen.getByRole("group", { name: "Package c" });
    await userEvent.click(within(section).getByRole("button", { name: /share/i }));
    expect(share).toHaveBeenCalledWith({ text: "Brief for c" });
  });

  // TST-085 · level: component · module: MOD-case-screens
  // guards: AGREE-WITH-PROFESSIONAL-BEFOREHAND
  // given: an outcome with a DIY preparation package for a professional
  // input: the outcome screen is opened
  // expect: the advice to agree the preparation with the electrician first is shown
  it("advises to agree a preparation package with the professional first (AGREE-WITH-PROFESSIONAL-BEFOREHAND)", async () => {
    render(<OutcomeScreen caseId={await openOutcome()} />);
    expect(screen.getByText(/Agree the prep with your electrician first/)).toBeInTheDocument();
  });
});
