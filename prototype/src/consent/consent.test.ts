import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CONSENT_PURPOSES,
  clearConsents,
  giveConsent,
  hasConsent,
  listConsents,
  registerPurge,
  useConsents,
  withdrawConsent,
} from "./index";

const KEY = "daiy.v1.consents";

beforeEach(() => {
  clearConsents();
  localStorage.clear();
});

describe("MOD-consent", () => {
  it("has a plain-language purpose for every kind", () => {
    expect(CONSENT_PURPOSES["keep-case-photos"]).toMatch(/\S/);
  });

  it("answers false and lists nothing without a consent", () => {
    expect(hasConsent("keep-case-photos")).toBe(false);
    expect(listConsents()).toEqual([]);
  });

  it("records a given consent with its time", () => {
    giveConsent("keep-case-photos");
    expect(hasConsent("keep-case-photos")).toBe(true);
    const [record] = listConsents();
    expect(record).toMatchObject({ kind: "keep-case-photos", given: true });
    expect(Number.isNaN(Date.parse(record?.at ?? ""))).toBe(false);
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });

  it("records the withdrawal after giving", async () => {
    giveConsent("keep-case-photos");
    await withdrawConsent("keep-case-photos");
    expect(hasConsent("keep-case-photos")).toBe(false);
    expect(listConsents()).toHaveLength(1);
    expect(listConsents()[0]).toMatchObject({ kind: "keep-case-photos", given: false });
  });

  it("runs the registered purge once on withdrawal, after recording it", async () => {
    let givenDuringPurge: boolean | undefined;
    const purge = vi.fn(async () => {
      givenDuringPurge = hasConsent("keep-case-photos");
    });
    registerPurge("keep-case-photos", purge);
    giveConsent("keep-case-photos");
    expect(purge).not.toHaveBeenCalled();
    await withdrawConsent("keep-case-photos");
    expect(purge).toHaveBeenCalledTimes(1);
    expect(givenDuringPurge).toBe(false);
  });

  it("gives again with the same single call", async () => {
    giveConsent("keep-case-photos");
    await withdrawConsent("keep-case-photos");
    giveConsent("keep-case-photos");
    expect(hasConsent("keep-case-photos")).toBe(true);
    expect(listConsents()).toHaveLength(1);
  });

  it("passes on a rejected purge and keeps the withdrawal recorded", async () => {
    let failing = true;
    registerPurge("keep-case-photos", async () => {
      if (failing) throw new Error("purge failed");
    });
    giveConsent("keep-case-photos");
    await expect(withdrawConsent("keep-case-photos")).rejects.toThrow("purge failed");
    failing = false;
    expect(hasConsent("keep-case-photos")).toBe(false);
  });

  it("clearConsents leaves no key", () => {
    giveConsent("keep-case-photos");
    clearConsents();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(listConsents()).toEqual([]);
  });

  it("treats damaged storage as no consent", () => {
    localStorage.setItem(KEY, "{not json");
    expect(hasConsent("keep-case-photos")).toBe(false);
    expect(listConsents()).toEqual([]);
  });

  it("useConsents follows give and withdraw", async () => {
    const { result } = renderHook(() => useConsents());
    expect(result.current).toEqual([]);
    act(() => giveConsent("keep-case-photos"));
    expect(result.current[0]).toMatchObject({ given: true });
    await act(async () => {
      await withdrawConsent("keep-case-photos");
    });
    expect(result.current[0]).toMatchObject({ given: false });
    act(() => clearConsents());
    expect(result.current).toEqual([]);
  });
});
