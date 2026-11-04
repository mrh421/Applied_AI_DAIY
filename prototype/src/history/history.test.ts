// Level: component
// Module: MOD-history

import "fake-indexeddb/auto";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { giveConsent, withdrawConsent } from "../consent";
import { StorageFullError, localStore } from "../local-store";
import {
  getCase,
  getPhoto,
  getPhotos,
  listCases,
  removeCase,
  saveCase,
  savePhoto,
  useHistory,
  type CaseRecord,
} from "./index";

const record = (id: string, createdAt: string, over: Partial<CaseRecord> = {}): CaseRecord => ({
  id,
  createdAt,
  rulesVersion: "1",
  chosenOffers: {},
  status: "ongoing",
  description: "Tap drips",
  hadPhoto: false,
  answers: [],
  round: 0,
  outcome: null,
  chosenOptionId: null,
  explanations: {},
  checked: {},
  notes: "",
  budget: null,
  materialsUsed: [],
  ...over,
});

beforeEach(async () => {
  await localStore.clearAll();
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MOD-history records (PROJECT-HISTORY)", () => {
  it("lists ongoing and completed records, newest first", () => {
    saveCase(record("a", "2026-01-01T00:00:00Z"));
    saveCase(record("b", "2026-03-01T00:00:00Z", { status: "completed" }));
    saveCase(record("c", "2026-02-01T00:00:00Z"));
    expect(listCases().map((c) => c.id)).toEqual(["b", "c", "a"]);
    expect(listCases().map((c) => c.status)).toEqual(["completed", "ongoing", "ongoing"]);
  });

  it("fills the fields that a record of an earlier version lacks", () => {
    const old = {
      id: "old",
      createdAt: "2026-01-01T00:00:00Z",
      rulesVersion: "1",
      status: "ongoing",
      description: "Rusty plate",
      hadPhoto: true,
      outcome: { type: "guidance", summary: "s", options: [{ id: "o1", title: "t" }] },
    };
    localStore.put("cases", "old", old);
    const got = getCase("old") as CaseRecord;
    expect(got.chosenOffers).toEqual({});
    expect(got.explanations).toEqual({});
    expect(got.checked).toEqual({});
    expect(got.notes).toBe("");
    expect(got.materialsUsed).toEqual([]);
    expect(got.outcome).toMatchObject({ assumptions: [], notices: [], photoAlt: null });
    expect(listCases()[0]?.outcome).toMatchObject({ options: [{ id: "o1", packages: [] }] });
  });

  it("gets one record, or undefined", () => {
    saveCase(record("a", "2026-01-01T00:00:00Z"));
    expect(getCase("a")?.description).toBe("Tap drips");
    expect(getCase("zzz")).toBeUndefined();
  });

  // TST-052 · level: unit · module: MOD-history
  // guards: PROJECT-HISTORY; STEP-CHECK-OFF; DEDUCT-CONSUMED
  // given: a saved case with two checked steps, a note and one used material that names its inventory item
  // input: the case is read back from the history
  // expect: the checked steps, the note and the used material with its inventory item are all there
  it("persists check-off states, notes and materials used (STEP-CHECK-OFF, DEDUCT-CONSUMED)", () => {
    saveCase(
      record("a", "2026-01-01T00:00:00Z", {
        checked: { p1: [1, 2] },
        notes: "bought washer",
        materialsUsed: [
          { name: "washer", quantity: { amount: 2, unit: "piece" }, inventoryItemId: "m1" },
        ],
      }),
    );
    const back = getCase("a");
    expect(back?.checked).toEqual({ p1: [1, 2] });
    expect(back?.notes).toBe("bought washer");
    expect(back?.materialsUsed[0]?.inventoryItemId).toBe("m1");
  });

  it("overwrites a record with the same id (DATA-RECTIFICATION)", () => {
    saveCase(record("a", "2026-01-01T00:00:00Z"));
    saveCase(record("a", "2026-01-01T00:00:00Z", { notes: "changed" }));
    expect(listCases()).toHaveLength(1);
    expect(getCase("a")?.notes).toBe("changed");
  });

  it("stores in the collection cases of the local store", () => {
    saveCase(record("a", "2026-01-01T00:00:00Z"));
    expect(localStore.list("cases")).toHaveLength(1);
    expect(localStorage.getItem("daiy.v1.cases")).not.toBeNull();
  });

  it("removes a record", () => {
    saveCase(record("a", "2026-01-01T00:00:00Z"));
    removeCase("a");
    expect(getCase("a")).toBeUndefined();
    expect(listCases()).toEqual([]);
  });

  it("passes StorageFullError on", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(() => saveCase(record("a", "2026-01-01T00:00:00Z"))).toThrow(StorageFullError);
  });
});

describe("MOD-history photos (DEVICE-STORAGE-CONSENT)", () => {
  const blob = () => new Blob(["x"], { type: "image/jpeg" });

  // TST-053 · level: unit · module: MOD-history
  // guards: DEVICE-STORAGE-CONSENT
  // given: no consent to keep case photos
  // input: a photo of a case is saved
  // expect: the save reports false and no photo can be read back
  it("does not save a photo without consent", async () => {
    expect(await savePhoto("a", blob())).toBe(false);
    expect(await getPhoto("a")).toBeUndefined();
  });

  it("saves and returns a photo with consent", async () => {
    giveConsent("keep-case-photos");
    expect(await savePhoto("a", blob())).toBe(true);
    expect(await getPhoto("a")).toBeDefined();
  });

  it("keeps several photos of a case in order and deletes them with the case", async () => {
    giveConsent("keep-case-photos");
    saveCase(record("a", "2026-01-01T00:00:00Z", { hadPhoto: true, photoCount: 3 }));
    for (const [i, t] of ["one", "two", "three"].entries()) {
      await savePhoto("a", new Blob([t], { type: "image/jpeg" }), i);
    }
    const got = await getPhotos("a", 3);
    expect(got).toHaveLength(3);
    removeCase("a");
    await vi.waitFor(async () => expect(await getPhotos("a", 3)).toHaveLength(0));
  });

  // TST-054 · level: unit · module: MOD-history
  // guards: CONSENT-WITHDRAWAL
  // given: consent to keep case photos and a saved photo
  // input: the consent is withdrawn
  // expect: the photo can no longer be read
  it("loses the photo when the consent is withdrawn", async () => {
    giveConsent("keep-case-photos");
    await savePhoto("a", blob());
    await withdrawConsent("keep-case-photos");
    expect(await getPhoto("a")).toBeUndefined();
  });
});

describe("MOD-history useHistory", () => {
  it("follows changes", () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current).toEqual([]);
    act(() => saveCase(record("a", "2026-01-01T00:00:00Z")));
    expect(result.current.map((c) => c.id)).toEqual(["a"]);
    act(() => removeCase("a"));
    expect(result.current).toEqual([]);
  });
});
