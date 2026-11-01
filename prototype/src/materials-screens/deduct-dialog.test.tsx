import "fake-indexeddb/auto";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveMaterial } from "../inventory";
import { localStore } from "../local-store";
import { guidance, guide, material, session } from "./fixtures";

const hook = vi.hoisted(() => ({ session: null as unknown, complete: vi.fn() }));
vi.mock("../case-session", () => ({
  useCaseSession: () => ({ session: hook.session, complete: hook.complete }),
}));

import { DeductDialog } from "./index";

const plan = guidance([
  { id: "o1", guide: guide([material("m-seal", "Seal", 2), material("m-tape", "Tape", 1)]) },
]);

let sealId = "";
beforeEach(async () => {
  vi.resetAllMocks();
  await localStore.clearAll();
  localStorage.clear();
  hook.session = session(plan);
  hook.complete.mockReturnValue({ ok: true });
  const r = saveMaterial({ name: "Seal", amount: 5, unit: "piece" });
  sealId = r.ok ? r.item.id : "";
});

const open = () => render(<DeductDialog caseId="c1" open onClose={() => {}} />);
const sealField = () => screen.getByRole("textbox", { name: "Used: Seal (piece)" });

describe("DeductDialog", () => {
  it("renders nothing when closed", () => {
    render(<DeductDialog caseId="c1" open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("proposes the needed quantities and shows the new inventory quantities (DEDUCT-CONSUMED)", () => {
    open();
    expect(sealField()).toHaveValue("2");
    expect(screen.getByText(/Seal: new quantity in inventory 3 piece/)).toBeInTheDocument();
  });

  it("confirms once with the used quantities and shows the single result", async () => {
    open();
    await userEvent.clear(sealField());
    await userEvent.type(sealField(), "1");
    await userEvent.click(screen.getByRole("button", { name: "Complete and deduct" }));
    expect(hook.complete).toHaveBeenCalledTimes(1);
    expect(hook.complete).toHaveBeenCalledWith([
      { name: "Seal", quantity: { amount: 1, unit: "piece" }, inventoryItemId: sealId },
      { name: "Tape", quantity: { amount: 1, unit: "piece" } },
    ]);
    expect(screen.getByText(/Project completed/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Complete and deduct" })).not.toBeInTheDocument();
  });

  it("shows the new quantity as 0 when more is used than is held", async () => {
    open();
    await userEvent.clear(sealField());
    await userEvent.type(sealField(), "9");
    expect(screen.getByText(/Seal: new quantity in inventory 0 piece/)).toBeInTheDocument();
  });

  it("names the field of an invalid quantity and does not complete", async () => {
    open();
    await userEvent.clear(sealField());
    await userEvent.type(sealField(), "-1");
    await userEvent.click(screen.getByRole("button", { name: "Complete and deduct" }));
    expect(screen.getByText(/Used: Seal \(piece\): .*number/)).toBeInTheDocument();
    expect(hook.complete).not.toHaveBeenCalled();
  });

  it("can be declined: completes without deducting", async () => {
    open();
    await userEvent.click(screen.getByRole("button", { name: "Complete without deducting" }));
    expect(hook.complete).toHaveBeenCalledTimes(1);
    expect(hook.complete).toHaveBeenCalledWith([]);
  });

  it("reports a full storage", async () => {
    hook.complete.mockReturnValue({ ok: false, reason: "storage-full" });
    open();
    await userEvent.click(screen.getByRole("button", { name: "Complete and deduct" }));
    expect(screen.getByText(/storage is full/i)).toBeInTheDocument();
  });
});
