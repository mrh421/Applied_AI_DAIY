import "fake-indexeddb/auto";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getCase, saveCase, type CaseRecord } from "../history";
import { listMaterials, listTools, saveMaterial } from "../inventory";
import { localStore } from "../local-store";
import { getProfile } from "../profile";
import { HistoryScreen, InventoryScreen, ProfileScreen } from "./index";

// Radix Select needs these pointer and scroll APIs, which jsdom lacks.
Object.assign(Element.prototype, {
  hasPointerCapture: () => false,
  setPointerCapture: () => {},
  releasePointerCapture: () => {},
  scrollIntoView: () => {},
});

beforeEach(async () => {
  await localStore.clearAll();
  localStorage.clear();
});
afterEach(cleanup);

const record = (over: Partial<CaseRecord> = {}): CaseRecord => ({
  id: "c1",
  createdAt: "2026-11-01T10:00:00Z",
  rulesVersion: "1",
  chosenOffers: {},
  status: "ongoing",
  description: "Dripping tap",
  hadPhoto: false,
  answers: [],
  round: 0,
  outcome: null,
  chosenOptionId: null,
  explanations: {},
  checked: {},
  notes: "first note",
  budget: null,
  materialsUsed: [{ name: "Seal", quantity: { amount: 2, unit: "piece" } }],
  ...over,
});

describe("ProfileScreen", () => {
  it("shows every area as not set and stores a chosen level", async () => {
    const user = userEvent.setup();
    render(<ProfileScreen />);
    const plumbing = screen.getByLabelText("Plumbing");
    expect(plumbing).toHaveTextContent(/not set/i);
    await user.click(plumbing);
    await user.click(await screen.findByRole("option", { name: "Experienced" }));
    expect(getProfile().levels.plumbing).toBe("experienced");
    expect(screen.getByLabelText("Plumbing")).toHaveTextContent("Experienced");
  });

  it("shows a stored level after a reload and clears it again", async () => {
    const user = userEvent.setup();
    render(<ProfileScreen />);
    await user.click(screen.getByLabelText("Bikes"));
    await user.click(await screen.findByRole("option", { name: "Some experience" }));
    cleanup();
    render(<ProfileScreen />);
    expect(screen.getByLabelText("Bikes")).toHaveTextContent("Some experience");
    await user.click(screen.getByLabelText("Bikes"));
    await user.click(await screen.findByRole("option", { name: /not set/i }));
    expect(getProfile().levels.bikes).toBeUndefined();
  });
});

describe("InventoryScreen", () => {
  it("names the field of each error and stores nothing", async () => {
    const user = userEvent.setup();
    render(<InventoryScreen />);
    await user.click(screen.getByRole("button", { name: "Add material" }));
    expect(screen.getByText(/Material name: Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/Amount: Amount must be a number/)).toBeInTheDocument();
    expect(screen.getByText(/Unit: Choose a unit/)).toBeInTheDocument();
    expect(listMaterials()).toHaveLength(0);
  });

  it("adds a material and a tool and removes them", async () => {
    const user = userEvent.setup();
    render(<InventoryScreen />);
    await user.type(screen.getByLabelText("Material name"), "Screws");
    await user.type(screen.getByLabelText("Amount"), "20");
    await user.click(screen.getByLabelText("Unit"));
    await user.click(await screen.findByRole("option", { name: "piece" }));
    await user.click(screen.getByRole("button", { name: "Add material" }));
    expect(listMaterials()).toHaveLength(1);
    expect(screen.getByText(/Screws: 20 piece/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Tool name"), "Wrench");
    await user.click(screen.getByRole("button", { name: "Add tool" }));
    expect(listTools().map((t) => t.name)).toEqual(["Wrench"]);

    await user.click(screen.getByRole("button", { name: "Remove Screws" }));
    await user.click(screen.getByRole("button", { name: "Remove Wrench" }));
    expect(listMaterials()).toHaveLength(0);
    expect(listTools()).toHaveLength(0);
  });

  it("a corrected entry replaces the old one and keeps no old value (UC-021)", async () => {
    const user = userEvent.setup();
    saveMaterial({ name: "Screws", amount: 20, unit: "piece" });
    render(<InventoryScreen />);
    await user.click(screen.getByRole("button", { name: "Change Screws" }));
    const amount = screen.getByLabelText("Amount");
    await user.clear(amount);
    await user.type(amount, "5");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    const items = listMaterials();
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity.amount).toBe(5);
    expect(screen.queryByText(/20 piece/)).not.toBeInTheDocument();
    expect(screen.getByText(/Screws: 5 piece/)).toBeInTheDocument();
  });
});

describe("HistoryScreen", () => {
  it("shows an empty state", () => {
    render(<HistoryScreen />);
    expect(screen.getByText("You have no cases yet.")).toBeInTheDocument();
  });

  it("lists ongoing and completed cases and opens one with its materials and notes", async () => {
    const user = userEvent.setup();
    saveCase(record());
    saveCase(
      record({
        id: "c2",
        description: "Wobbly chair",
        status: "completed",
        createdAt: "2026-10-01T10:00:00Z",
      }),
    );
    render(<HistoryScreen />);
    expect(screen.getByText("Ongoing")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    const row = screen.getByText("Dripping tap").closest("li") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: "Open" }));
    expect(screen.getByText("Seal: 2 piece")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toHaveValue("first note");
  });

  it("stores a corrected note and keeps nothing of the old one", async () => {
    const user = userEvent.setup();
    saveCase(record());
    render(<HistoryScreen />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const notes = screen.getByLabelText("Notes");
    await user.clear(notes);
    await user.type(notes, "corrected");
    await user.click(screen.getByRole("button", { name: "Save notes" }));
    expect(getCase("c1")?.notes).toBe("corrected");
    expect(getCase("c1")?.description).toBe("Dripping tap");
  });

  it("lets the user continue an ongoing case and read a finished one again", async () => {
    const user = userEvent.setup();
    const step = (n: number, text: string) => ({
      n,
      text,
      opensDevice: false,
      switchesOffCircuit: false,
      fixedSafetyStep: false,
      imageIds: [],
    });
    const outcome = {
      type: "guidance",
      summary: "A tap drips.",
      assumptions: [],
      notices: [],
      photoAlt: null,
      options: [
        {
          id: "o1",
          kind: "repair",
          title: "Repair it",
          packages: [
            {
              id: "p1",
              title: "Change the seal",
              area: "plumbing",
              label: "diy",
              reason: "Simple.",
              labelUncertain: false,
              decidingInformation: [],
              handoverBrief: "Brief.",
              flags: { opensMainsHousing: false, carriesPerson: false, waterRelated: false },
              guide: {
                diagnosis: "Worn.",
                tools: [],
                materials: [],
                steps: [step(1, "Close the valve."), step(2, "Change the seal.")],
                estimatedMinutes: { min: 5, max: 10 },
                warnings: [],
              },
            },
          ],
        },
      ],
    } as unknown as CaseRecord["outcome"];
    saveCase(record({ outcome, checked: { p1: [1] } }));
    const { unmount } = render(<HistoryScreen />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(
      screen.getByRole("link", { name: "Continue the work: Change the seal" }),
    ).toHaveAttribute("href", "/case/c1/work/p1");
    expect(screen.getByRole("link", { name: "Read the plan again" })).toHaveAttribute(
      "href",
      "/case/c1",
    );
    expect(screen.getByRole("link", { name: "Materials and tools" })).toHaveAttribute(
      "href",
      "/case/c1/materials",
    );
    expect(screen.getByText(/1 of 2 steps done/)).toBeInTheDocument();
    expect(screen.getByText(/Close the valve\. \(done\)/)).toBeInTheDocument();
    unmount();

    saveCase(record({ outcome, status: "completed", checked: { p1: [1, 2] } }));
    render(<HistoryScreen />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(
      screen.getByRole("link", { name: "Read the steps again: Change the seal" }),
    ).toBeInTheDocument();
  });
});
