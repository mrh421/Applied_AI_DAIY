// Level: component
// Module: MOD-profile

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

  it("reads a stored profile of another shape without failing and keeps only valid levels", () => {
    for (const data of [{}, { levels: null }, { levels: "x" }, null, "text"]) {
      localStore.put("profile", "profile", data);
      expect(getProfile()).toEqual({ levels: {} });
    }
    localStore.put("profile", "profile", {
      levels: { plumbing: "experienced", garden: "intermediate", cooking: "beginner" },
    });
    expect(getProfile()).toEqual({ levels: { plumbing: "experienced" } });
  });

  // TST-049 · level: unit · module: MOD-profile
  // guards: DEFAULT-BEGINNER
  // given: a profile in which no skill level is set for plumbing
  // input: the level for plumbing is asked
  // expect: the level is beginner
  it("gives beginner for an unset area (DEFAULT-BEGINNER)", () => {
    expect(levelFor("plumbing")).toBe("beginner");
  });

  // TST-050 · level: unit · module: MOD-profile
  // guards: SKILL-PROFILE
  // given: an empty profile
  // input: a level is set for plumbing and for garden, and the plumbing level is changed
  // expect: each area keeps its own level, the change is kept, and an area never set still reads beginner
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

  // TST-051 · level: unit · module: MOD-profile
  // guards: DATA-RECTIFICATION
  // given: a profile with the level experienced for plumbing
  // input: that level is cleared
  // expect: the profile holds no level and plumbing reads beginner again
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
