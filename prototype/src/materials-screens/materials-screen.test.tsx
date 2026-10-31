import "fake-indexeddb/auto";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listMaterials, listTools, saveMaterial, saveTool } from "../inventory";
import { localStore } from "../local-store";
import { guidance, guide, material, offer, session, tool } from "./fixtures";

const hook = vi.hoisted(() => ({
  session: null as unknown,
  complete: vi.fn(),
  setBudget: vi.fn(),
  setChosenOffer: vi.fn(),
}));
vi.mock("../case-session", () => ({
  useCaseSession: () => ({
    session: hook.session,
    complete: hook.complete,
    setBudget: hook.setBudget,
    setChosenOffer: hook.setChosenOffer,
  }),
}));

const cat = vi.hoisted(() => ({ offers: [] as unknown[] }));
vi.mock("../catalogue", () => ({
  CATALOGUE_IS_SAMPLE: true,
  searchOffers: () => ({ offers: cat.offers, noMatch: cat.offers.length === 0 }),
  searchModels: async () => [],
  printedPartNote: () => null,
  toolHint: (n: { name: string; rentable: boolean }) =>
    n.rentable ? `Rent or borrow the ${n.name}.` : null,
}));

import { MaterialsScreen } from "./index";

const plan = guidance([
  {
    id: "o1",
    guide: guide(
      [
        material("m-seal", "Seal", 1),
        material("m-washer", "Washer", 3),
        material("m-gasket", "Gasket", 2),
      ],
      [tool("t-spanner", "Spanner"), tool("t-drill", "Drill", true), tool("t-saw", "Saw")],
    ),
  },
]);

const priced = (amount: number) =>
  offer({
    id: "x",
    unitPrice: { certainty: "verified", value: { amount, currency: "EUR" }, source: "s" },
  });

beforeEach(async () => {
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  cat.offers = [];
  hook.session = session(plan);
  hook.complete.mockReturnValue({ ok: true });
  saveMaterial({ name: "Seal", amount: 1, unit: "piece" });
  saveMaterial({ name: "Washer", amount: 1, unit: "piece" });
  saveTool("Saw");
});

describe("materials list", () => {
  it("lists own stock first, with each status as text (OWN-STOCK-FIRST, PARTLY-AVAILABLE)", () => {
    render(<MaterialsScreen caseId="c1" />);
    const items = within(screen.getByRole("list", { name: "Materials" })).getAllByRole("listitem");
    expect(items.map((i) => i.textContent)).toEqual([
      expect.stringMatching(/Seal.*Available/),
      expect.stringMatching(/Washer.*Partly available.*2 piece missing/),
      expect.stringMatching(/Gasket.*Missing.*2 piece/),
    ]);
  });

  it("links to offers only for items that are not fully available (SUGGESTIONS-ONLY-FOR-MISSING)", () => {
    render(<MaterialsScreen caseId="c1" />);
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/case/c1/offers/m-washer", "/case/c1/offers/m-gasket"]);
  });

  it("lists missing tools apart, with the rent-or-borrow hint where sensible (MISSING-TOOLS-SEPARATE)", () => {
    render(<MaterialsScreen caseId="c1" />);
    const missing = within(screen.getByRole("list", { name: "Missing tools" }));
    expect(missing.getAllByRole("listitem").map((i) => i.textContent)).toEqual([
      expect.stringMatching(/Spanner/),
      expect.stringMatching(/Drill.*Rent or borrow the Drill\./),
    ]);
    expect(screen.getByRole("list", { name: "Materials" })).not.toHaveTextContent("Spanner");
    expect(screen.getByRole("list", { name: "Tools you own" })).toHaveTextContent("Saw");
  });

  it("shows no materials section when no materials are needed", () => {
    hook.session = session(guidance([{ id: "o1", guide: guide([], [tool("t1", "Spanner")]) }]));
    render(<MaterialsScreen caseId="c1" />);
    expect(screen.queryByRole("list", { name: "Materials" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Materials" })).not.toBeInTheDocument();
  });
});

describe("saving owned items (OFFER-SAVE-OWNED-ITEMS)", () => {
  it("offers to save the items marked as owned, and saves them", async () => {
    render(<MaterialsScreen caseId="c1" />);
    expect(screen.queryByRole("button", { name: "Save to inventory" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "I own this: Gasket" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "I own this: Spanner" }));
    await userEvent.click(screen.getByRole("button", { name: "Save to inventory" }));
    expect(listMaterials().find((m) => m.name === "Gasket")?.quantity).toEqual({
      amount: 2,
      unit: "piece",
    });
    expect(listTools().map((t) => t.name)).toContain("Spanner");
  });

  it("does not block when the offer is declined", async () => {
    render(<MaterialsScreen caseId="c1" />);
    await userEvent.click(screen.getByRole("checkbox", { name: "I own this: Gasket" }));
    await userEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(listMaterials().map((m) => m.name)).not.toContain("Gasket");
    expect(screen.queryByRole("button", { name: "Save to inventory" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete project" })).toBeEnabled();
  });
});

describe("budget panel (TOTAL-COST-ESTIMATE, BUDGET-RESPECTED, UNCHECKED-PRICE-OR-FIT-MARKED)", () => {
  it("states the total per option and whether it is within the budget, as text", () => {
    cat.offers = [priced(4)];
    hook.session = session(plan, { budget: { amount: 10, currency: "EUR" } });
    render(<MaterialsScreen caseId="c1" />);
    const panel = screen.getByRole("region", { name: "Cost estimate" });
    // Washer 2 x 4 + Gasket 2 x 4 = 16
    expect(panel).toHaveTextContent("Total: 16.00 EUR");
    expect(panel).toHaveTextContent("exceeds budget");
    expect(panel).toHaveTextContent("No option stays within your budget");
  });

  it("says within budget when the total fits", () => {
    cat.offers = [priced(1)];
    hook.session = session(plan, { budget: { amount: 10, currency: "EUR" } });
    render(<MaterialsScreen caseId="c1" />);
    expect(screen.getByRole("region", { name: "Cost estimate" })).toHaveTextContent(
      "within budget",
    );
  });

  it("marks prices and fits that still need checking", () => {
    cat.offers = [
      offer({
        id: "x",
        unitPrice: { certainty: "unverified", value: { amount: 4, currency: "EUR" } },
        compatibility: { certainty: "unverified", value: null },
      }),
    ];
    render(<MaterialsScreen caseId="c1" />);
    const panel = screen.getByRole("region", { name: "Cost estimate" });
    expect(panel).toHaveTextContent("Price to check: Washer");
    expect(panel).toHaveTextContent("Fit to check: Gasket");
  });

  it("stores a valid budget and names the field of an invalid one", async () => {
    render(<MaterialsScreen caseId="c1" />);
    const field = screen.getByRole("textbox", { name: "Budget (EUR)" });
    await userEvent.type(field, "12.5");
    expect(hook.setBudget).toHaveBeenLastCalledWith({ amount: 12.5, currency: "EUR" });
    await userEvent.clear(field);
    expect(hook.setBudget).toHaveBeenLastCalledWith(null);
    hook.setBudget.mockClear();
    await userEvent.type(field, "abc");
    expect(screen.getByText(/Budget \(EUR\): .*number/)).toBeInTheDocument();
    expect(hook.setBudget).not.toHaveBeenCalled();
  });
});

describe("completion", () => {
  it("opens the deduction dialog", async () => {
    render(<MaterialsScreen caseId="c1" />);
    await userEvent.click(screen.getByRole("button", { name: "Complete project" }));
    expect(screen.getByRole("dialog", { name: "Complete project" })).toBeInTheDocument();
  });
});
