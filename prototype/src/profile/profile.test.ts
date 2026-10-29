import "fake-indexeddb/auto";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StorageFullError, localStore } from "../local-store";
import { clearLevel, getProfile, levelFor, setLevel, useProfile } from "./index";

beforeEach(async () => {
  await localStore.clearAll();
  localStorage.clear();
});

describe("MOD-profile", () => {
  it("gives an empty profile when none exists", () => {
    expect(getProfile()).toEqual({ levels: {} });
  });

  it("gives beginner for an unset area (DEFAULT-BEGINNER)", () => {
    expect(levelFor("plumbing")).toBe("beginner");
  });

  it("sets and changes a level per area (SKILL-PROFILE)", () => {
    setLevel("plumbing", "experienced");
    setLevel("garden", "some-experience");
    expect(levelFor("plumbing")).toBe("experienced");
    setLevel("plumbing", "some-experience");
    expect(getProfile().levels).toEqual({
      plumbing: "some-experience",
      garden: "some-experience",
    });
    expect(levelFor("woodwork")).toBe("beginner");
  });

  it("clears a level, which falls back to beginner (DATA-RECTIFICATION)", () => {
    setLevel("plumbing", "experienced");
    clearLevel("plumbing");
    expect(getProfile().levels).toEqual({});
    expect(levelFor("plumbing")).toBe("beginner");
  });

  it("clearing an unset area changes nothing", () => {
    expect(() => clearLevel("bikes")).not.toThrow();
    expect(getProfile()).toEqual({ levels: {} });
  });

  it("persists as the record 'profile' of the collection 'profile' (PROFILE-ON-DEVICE)", () => {
    setLevel("bikes", "experienced");
    expect(localStorage.getItem("daiy.v1.profile")).not.toBeNull();
    expect(localStore.get("profile", "profile")?.data).toEqual({
      levels: { bikes: "experienced" },
    });
  });

  it("survives a reload", async () => {
    setLevel("bikes", "experienced");
    vi.resetModules();
    const fresh = await import("./index");
    expect(fresh.levelFor("bikes")).toBe("experienced");
  });

  it("passes on StorageFullError", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    try {
      expect(() => setLevel("bikes", "experienced")).toThrow(StorageFullError);
    } finally {
      spy.mockRestore();
    }
  });

  it("useProfile follows changes and keeps a stable snapshot", () => {
    const { result, rerender } = renderHook(() => useProfile());
    const first = result.current;
    expect(first).toEqual({ levels: {} });
    rerender();
    expect(result.current).toBe(first);
    act(() => setLevel("garden", "some-experience"));
    expect(result.current.levels).toEqual({ garden: "some-experience" });
  });
});
