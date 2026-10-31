import "fake-indexeddb/auto";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveMaterial } from "../inventory";
import { localStore } from "../local-store";
import { guidance, guide, material, offer, session } from "./fixtures";

const hook = vi.hoisted(() => ({ session: null as unknown, setChosenOffer: vi.fn() }));
vi.mock("../case-session", () => ({
  useCaseSession: () => ({ session: hook.session, setChosenOffer: hook.setChosenOffer }),
}));

const cat = vi.hoisted(() => ({
  searchOffers: vi.fn(),
  searchModels: vi.fn(),
  printedPartNote: vi.fn(),
}));
vi.mock("../catalogue", () => ({ CATALOGUE_IS_SAMPLE: true, ...cat, toolHint: () => null }));

import { OffersScreen } from "./index";

const plan = guidance([
  {
    id: "o1",
    guide: guide([
      material("m-seal", "Seal", 1),
      material("m-washer", "Washer", 3),
      material("m-part", "Knob", 1, "piece", { printable: true }),
    ]),
  },
]);

const secondHand = offer({
  id: "s1",
  title: "Used washer set",
  condition: "second-hand",
  sustainabilityReason: "Reuses a part that already exists.",
  compatibility: { certainty: "unverified", value: null },
  unitPrice: { certainty: "ai-estimate", value: { amount: 2, currency: "EUR" } },
  spec: {
    dimensionsMm: { certainty: "unverified", value: null },
    material: { certainty: "unverified", value: "steel" },
    function: { certainty: "verified", value: "seal", source: "Seller note" },
  },
  availability: { certainty: "unverified", value: "limited" },
});
const brandNew = offer({ id: "n1", title: "New washer set" });

beforeEach(async () => {
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  hook.session = session(plan);
  cat.searchOffers.mockReturnValue({ offers: [secondHand, brandNew], noMatch: false });
  cat.searchModels.mockResolvedValue([]);
  cat.printedPartNote.mockReturnValue(null);
});

const card = (title: string) => screen.getByRole("article", { name: title });

describe("offers", () => {
  it("says the catalogue is sample data (SAMPLE-PRODUCT-DATA)", () => {
    render(<OffersScreen caseId="c1" itemId="m-washer" />);
    expect(screen.getByRole("note")).toHaveTextContent(/sample data/i);
  });

  it("searches only for the missing quantity and lists second-hand offers first", () => {
    render(<OffersScreen caseId="c1" itemId="m-washer" />);
    expect(cat.searchOffers).toHaveBeenCalledWith(
      { name: "Washer", spec: {} },
      { amount: 3, unit: "piece" },
    );
    const titles = screen.getAllByRole("article").map((a) => a.getAttribute("aria-label"));
    expect(titles).toEqual(["Used washer set", "New washer set"]);
  });

  it("shows every datum with its certainty label, and a verified datum with its source", () => {
    render(<OffersScreen caseId="c1" itemId="m-washer" />);
    const c = within(card("New washer set"));
    expect(c.getByText(/Price: 5\.00 EUR.*verified.*Price list/)).toBeInTheDocument();
    expect(c.getByText(/Dimensions: .*20.*verified.*Data sheet/)).toBeInTheDocument();
    expect(c.getByText(/Compatibility: fits.*verified.*Maker/)).toBeInTheDocument();
    expect(c.getByText(/Availability: In stock.*verified.*Shop/)).toBeInTheDocument();
    expect(c.getByText(/Condition: New/)).toBeInTheDocument();
    expect(c.getByText(/Data as of 2026-10-01/)).toBeInTheDocument();
    expect(c.getByText(/Source: Sample shop/)).toBeInTheDocument();
  });

  it("shows unverified compatibility as uncertain and missing evidence as not stated", () => {
    render(<OffersScreen caseId="c1" itemId="m-washer" />);
    const c = within(card("Used washer set"));
    expect(c.getByText(/Compatibility: uncertain.*unverified/)).toBeInTheDocument();
    expect(c.getByText(/Dimensions: not stated.*unverified/)).toBeInTheDocument();
    expect(c.getByText(/Price: 2\.00 EUR.*AI estimate/)).toBeInTheDocument();
    expect(c.getByText(/Material: steel.*unverified/)).toBeInTheDocument();
    expect(c.getByText(/Availability: Limited stock.*unverified/)).toBeInTheDocument();
    expect(c.getByText(/Reuses a part that already exists\./)).toBeInTheDocument();
    expect(within(card("New washer set")).queryByText(/sustainab/i)).not.toBeInTheDocument();
  });

  it("sends the user to the seller and offers no purchase in the app", () => {
    render(<OffersScreen caseId="c1" itemId="m-washer" />);
    const link = within(card("New washer set")).getByRole("link", { name: /seller/i });
    expect(link).toHaveAttribute("href", "https://example.org/seller");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.queryByRole("button", { name: /buy|purchase|checkout|cart/i })).toBeNull();
  });

  it("lets the user choose an offer for the estimate", async () => {
    render(<OffersScreen caseId="c1" itemId="m-washer" />);
    await userEvent.click(
      within(card("New washer set")).getByRole("button", { name: /use .*estimate/i }),
    );
    expect(hook.setChosenOffer).toHaveBeenCalledWith("m-washer", "n1");
  });

  it("makes no suggestion for an item that is available in the inventory", () => {
    saveMaterial({ name: "Seal", amount: 1, unit: "piece" });
    render(<OffersScreen caseId="c1" itemId="m-seal" />);
    expect(cat.searchOffers).not.toHaveBeenCalled();
    expect(screen.getByText(/already in your inventory/i)).toBeInTheDocument();
  });

  it("says so when nothing matches", () => {
    cat.searchOffers.mockReturnValue({ offers: [], noMatch: true });
    render(<OffersScreen caseId="c1" itemId="m-washer" />);
    expect(screen.getByText(/no matching offer/i)).toBeInTheDocument();
  });
});

describe("3D model suggestion", () => {
  it("shows dimensions, material, licence, intended use and the link", async () => {
    cat.searchModels.mockResolvedValue([
      {
        id: "k1",
        title: "Knob model",
        spec: {},
        dimensionsMm: { diameter: 30, height: 15 },
        materialRequirements: "PETG",
        licence: "CC BY 4.0",
        intendedUse: "Decorative knob",
        url: "https://models.example.org/knob",
        provider: "ModelHub",
      },
    ]);
    render(<OffersScreen caseId="c1" itemId="m-part" />);
    const m = within(await screen.findByRole("article", { name: "Knob model" }));
    expect(m.getByText(/Dimensions: .*diameter 30 mm/)).toBeInTheDocument();
    expect(m.getByText(/Dimensions: .*height 15 mm/)).toBeInTheDocument();
    expect(m.getByText(/Material requirements: PETG/)).toBeInTheDocument();
    expect(m.getByText(/Licence: CC BY 4\.0/)).toBeInTheDocument();
    expect(m.getByText(/Intended use: Decorative knob/)).toBeInTheDocument();
    expect(m.getByRole("link", { name: /ModelHub/ })).toHaveAttribute(
      "href",
      "https://models.example.org/knob",
    );
  });

  it("shows the professional-review note instead of a model for a safety-critical part", async () => {
    cat.printedPartNote.mockReturnValue("Knob is safety-critical. Professional review needed.");
    render(<OffersScreen caseId="c1" itemId="m-part" />);
    expect(await screen.findByText(/Professional review needed/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ModelHub/ })).not.toBeInTheDocument();
  });
});
