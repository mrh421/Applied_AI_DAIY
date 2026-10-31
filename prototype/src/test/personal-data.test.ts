import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Component test of the subsystem Personal data (ARC-006, ITM-253): the five modules
// work together through the real local store, with fake-indexeddb for the photos.

type Modules = {
  consent: typeof import("../consent");
  history: typeof import("../history");
  inventory: typeof import("../inventory");
  localStore: typeof import("../local-store");
  profile: typeof import("../profile");
};

async function load(): Promise<Modules> {
  return {
    consent: await import("../consent"),
    history: await import("../history"),
    inventory: await import("../inventory"),
    localStore: await import("../local-store"),
    profile: await import("../profile"),
  };
}

/** A reload: every module is evaluated afresh; only localStorage and IndexedDB remain. */
async function reload(): Promise<Modules> {
  vi.resetModules();
  return load();
}

const caseRecord = (id: string): import("../history").CaseRecord => ({
  id,
  createdAt: "2026-01-01T00:00:00Z",
  rulesVersion: "1",
  chosenOffers: {},
  status: "ongoing",
  description: "Tap drips",
  hadPhoto: true,
  answers: [],
  round: 0,
  outcome: null,
  chosenOptionId: null,
  explanations: {},
  checked: { p1: [1] },
  notes: "bought washer",
  budget: null,
  materialsUsed: [],
});

const photo = () => new Blob(["jpeg"], { type: "image/jpeg" });

let sent: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  const { localStore } = await reload();
  await localStore.localStore.clearAll();
  localStorage.clear();
  sent = vi.fn(() => Promise.reject(new Error("no network in this test")));
  vi.stubGlobal("fetch", sent);
  vi.stubGlobal("XMLHttpRequest", vi.fn(sent));
  vi.stubGlobal("WebSocket", vi.fn(sent));
  Object.defineProperty(navigator, "sendBeacon", { value: sent, configurable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "sendBeacon");
});

describe("Personal data: persistence across a reload (PROFILE-ON-DEVICE, INVENTORY-ON-DEVICE, PROJECT-HISTORY)", () => {
  it("keeps profile, inventory, history and consent after a reload", async () => {
    const before = await load();
    before.profile.setLevel("plumbing", "experienced");
    const material = before.inventory.saveMaterial({ name: "Screws", amount: 20, unit: "piece" });
    before.inventory.saveTool("Hammer");
    before.history.saveCase(caseRecord("c1"));
    before.consent.giveConsent("keep-case-photos");
    await before.history.savePhoto("c1", photo());
    if (!material.ok) throw new Error("save failed");

    const after = await reload();
    expect(after.profile.levelFor("plumbing")).toBe("experienced");
    expect(after.profile.levelFor("garden")).toBe("beginner");
    expect(after.inventory.listMaterials()).toEqual([
      { id: material.item.id, name: "Screws", quantity: { amount: 20, unit: "piece" } },
    ]);
    expect(after.inventory.listTools().map((t) => t.name)).toEqual(["Hammer"]);
    expect(after.history.getCase("c1")?.checked).toEqual({ p1: [1] });
    expect(after.consent.hasConsent("keep-case-photos")).toBe(true);
    expect(await after.history.getPhoto("c1")).toBeDefined();
  });

  it("shares one store: a deduction shows in the snapshot and in the changed records", async () => {
    const m = await load();
    const saved = m.inventory.saveMaterial({ name: "Screws", amount: 20, unit: "piece" });
    if (!saved.ok) throw new Error("save failed");
    m.inventory.deduct([{ itemId: saved.item.id, amount: 5 }]);
    expect(m.inventory.snapshot().materials).toEqual([
      { name: "Screws", quantity: { amount: 15, unit: "piece" } },
    ]);
    const [record] = m.localStore.localStore.changedSince(0);
    expect(record).toMatchObject({ collection: "materials", id: saved.item.id });
  });
});

describe("Personal data: withdrawing consent (CONSENT-WITHDRAWAL)", () => {
  it("purges the photos in one action and keeps the records that are necessary", async () => {
    const m = await load();
    m.history.saveCase(caseRecord("c1"));
    m.profile.setLevel("bikes", "some-experience");
    m.consent.giveConsent("keep-case-photos");
    expect(await m.history.savePhoto("c1", photo())).toBe(true);

    await m.consent.withdrawConsent("keep-case-photos");

    expect(await m.history.getPhoto("c1")).toBeUndefined();
    expect(await m.history.savePhoto("c1", photo())).toBe(false);
    expect(m.history.getCase("c1")?.notes).toBe("bought washer");
    expect(m.profile.levelFor("bikes")).toBe("some-experience");
  });

  it("still purges after a reload", async () => {
    const before = await load();
    before.consent.giveConsent("keep-case-photos");
    await before.history.savePhoto("c1", photo());

    const after = await reload();
    await after.consent.withdrawConsent("keep-case-photos");
    expect(await after.history.getPhoto("c1")).toBeUndefined();
  });
});

describe("Personal data: only what is necessary or consented (UC-020)", () => {
  it("writes only keys that the register names, and no photo without consent", async () => {
    const m = await load();
    m.profile.setLevel("plumbing", "experienced");
    m.inventory.saveMaterial({ name: "Screws", amount: 1, unit: "piece" });
    m.inventory.saveTool("Hammer");
    m.history.saveCase(caseRecord("c1"));
    expect(await m.history.savePhoto("c1", photo())).toBe(false);
    m.consent.giveConsent("keep-case-photos");

    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) expect(m.localStore.STORAGE_REGISTER).toHaveProperty([key as string]);
    expect(await m.localStore.localStore.getBlob("case-photo", "c1")).toBeUndefined();
  });

  it("leaves nothing after clearAll and clearConsents", async () => {
    const m = await load();
    m.profile.setLevel("plumbing", "experienced");
    m.inventory.saveTool("Hammer");
    m.history.saveCase(caseRecord("c1"));
    m.consent.giveConsent("keep-case-photos");
    await m.history.savePhoto("c1", photo());

    await m.localStore.localStore.clearAll();

    expect(localStorage.length).toBe(0);
    expect(await m.history.getPhoto("c1")).toBeUndefined();
    expect(m.history.listCases()).toEqual([]);
    expect(m.consent.hasConsent("keep-case-photos")).toBe(false);
  });
});

describe("Personal data: nothing is sent to a server (USE-WITHOUT-ACCOUNT)", () => {
  it("uses no network while the data is created, read, changed, purged and cleared", async () => {
    const m = await load();
    m.profile.setLevel("plumbing", "experienced");
    m.profile.clearLevel("plumbing");
    const saved = m.inventory.saveMaterial({ name: "Screws", amount: 3, unit: "piece" });
    if (!saved.ok) throw new Error("save failed");
    m.inventory.deduct([{ itemId: saved.item.id, amount: 1 }]);
    m.inventory.removeMaterial(saved.item.id);
    m.history.saveCase(caseRecord("c1"));
    m.consent.giveConsent("keep-case-photos");
    await m.history.savePhoto("c1", photo());
    await m.history.getPhoto("c1");
    await m.consent.withdrawConsent("keep-case-photos");
    m.history.removeCase("c1");
    await m.localStore.localStore.clearAll();
    await reload();

    expect(sent).not.toHaveBeenCalled();
  });
});
