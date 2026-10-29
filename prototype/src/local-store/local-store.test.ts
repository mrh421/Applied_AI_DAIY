import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { giveConsent, withdrawConsent } from "../consent";
import {
  ConsentMissingError,
  STORAGE_REGISTER,
  StorageFullError,
  localStore,
  type StoredRecord,
} from "./index";

beforeEach(async () => {
  await localStore.clearAll();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const remote = (
  id: string,
  updatedAt: number,
  data: unknown,
  deleted = false,
): StoredRecord<unknown> => ({ id, collection: "materials", updatedAt, deleted, data });

describe("MOD-local-store records", () => {
  it("persists a record under the key of its collection (PROFILE-ON-DEVICE)", () => {
    const stored = localStore.put("profile", "p1", { level: "beginner" });
    expect(stored).toMatchObject({ id: "p1", collection: "profile", deleted: false });
    expect(localStorage.getItem("daiy.v1.profile")).not.toBeNull();
    expect(localStore.get("profile", "p1")).toEqual(stored);
    expect(localStore.list("profile")).toEqual([stored]);
  });

  it("sets updatedAt to now on every put", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    expect(localStore.put("tools", "t", 1).updatedAt).toBe(1000);
    vi.setSystemTime(2000);
    expect(localStore.put("tools", "t", 2).updatedAt).toBe(2000);
    expect(localStore.list("tools")).toHaveLength(1);
  });

  it("keeps collections apart", () => {
    localStore.put("tools", "x", 1);
    expect(localStore.list("materials")).toEqual([]);
    expect(localStore.get("materials", "x")).toBeUndefined();
  });

  it("returns nothing from damaged storage", () => {
    localStorage.setItem("daiy.v1.cases", "{not json");
    expect(localStore.list("cases")).toEqual([]);
  });

  it("throws StorageFullError when localStorage is full", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(() => localStore.put("cases", "c", {})).toThrow(StorageFullError);
  });
});

describe("MOD-local-store tombstones", () => {
  it("hides a removed record from list and get but keeps a tombstone for sync", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    localStore.put("materials", "m", { name: "screws" });
    vi.setSystemTime(2000);
    localStore.remove("materials", "m");
    expect(localStore.list("materials")).toEqual([]);
    expect(localStore.get("materials", "m")).toBeUndefined();
    const [tomb] = localStore.changedSince(0);
    expect(tomb).toMatchObject({ id: "m", deleted: true, updatedAt: 2000 });
  });

  it("removing an unknown record is a no-op", () => {
    localStore.remove("materials", "nope");
    expect(localStore.changedSince(0)).toEqual([]);
  });
});

describe("MOD-local-store changedSince", () => {
  it("returns records of all collections changed after the mark", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    localStore.put("profile", "a", 1);
    vi.setSystemTime(2000);
    localStore.put("tools", "b", 2);
    vi.setSystemTime(3000);
    localStore.put("cases", "c", 3);
    expect(
      localStore
        .changedSince(1000)
        .map((r) => r.id)
        .sort(),
    ).toEqual(["b", "c"]);
  });
});

describe("MOD-local-store applyRemote", () => {
  it("adds an unknown remote record", () => {
    localStore.applyRemote([remote("m", 5, "r")]);
    expect(localStore.get("materials", "m")?.data).toBe("r");
  });

  it("keeps the later updatedAt", () => {
    localStore.applyRemote([remote("m", 5, "old")]);
    localStore.applyRemote([remote("m", 9, "new")]);
    expect(localStore.get("materials", "m")?.data).toBe("new");
    localStore.applyRemote([remote("m", 7, "stale")]);
    expect(localStore.get("materials", "m")?.data).toBe("new");
  });

  it("keeps the local copy on a tie", () => {
    localStore.applyRemote([remote("m", 5, "local")]);
    localStore.applyRemote([remote("m", 5, "other")]);
    expect(localStore.get("materials", "m")?.data).toBe("local");
  });

  it("applies a newer remote tombstone", () => {
    localStore.applyRemote([remote("m", 5, "x")]);
    localStore.applyRemote([remote("m", 6, null, true)]);
    expect(localStore.list("materials")).toEqual([]);
  });
});

describe("MOD-local-store subscribe", () => {
  it("notifies with the changed collection until unsubscribed", () => {
    const listener = vi.fn();
    const off = localStore.subscribe(listener);
    localStore.put("tools", "t", 1);
    localStore.remove("tools", "t");
    localStore.applyRemote([remote("m", 1, 1)]);
    expect(listener.mock.calls).toEqual([["tools"], ["tools"], ["materials"]]);
    off();
    localStore.put("tools", "u", 1);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("does not notify when applyRemote changes nothing", () => {
    localStore.applyRemote([remote("m", 5, "a")]);
    const listener = vi.fn();
    localStore.subscribe(listener);
    localStore.applyRemote([remote("m", 5, "b")]);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("MOD-local-store blobs (DEVICE-STORAGE-CONSENT)", () => {
  const photo = () => new Blob(["jpeg"], { type: "image/jpeg" });

  it("refuses a blob without consent", async () => {
    await expect(localStore.putBlob("case-photo", "c1", photo())).rejects.toBeInstanceOf(
      ConsentMissingError,
    );
    await expect(localStore.putBlob("case-photo", "c1", photo())).rejects.toMatchObject({
      consent: "keep-case-photos",
    });
    expect(await localStore.getBlob("case-photo", "c1")).toBeUndefined();
  });

  it("stores and returns a blob under consent", async () => {
    giveConsent("keep-case-photos");
    await localStore.putBlob("case-photo", "c1", photo());
    // fake-indexeddb does not clone a jsdom Blob faithfully, so only presence is checked.
    expect(await localStore.getBlob("case-photo", "c1")).toBeDefined();
  });

  it("purges the photos when the consent is withdrawn (CONSENT-WITHDRAWAL)", async () => {
    giveConsent("keep-case-photos");
    await localStore.putBlob("case-photo", "c1", photo());
    await localStore.putBlob("case-photo", "c2", photo());
    await withdrawConsent("keep-case-photos");
    expect(await localStore.getBlob("case-photo", "c1")).toBeUndefined();
    expect(await localStore.getBlob("case-photo", "c2")).toBeUndefined();
  });

  it("removeBlobs removes every blob of the kind", async () => {
    giveConsent("keep-case-photos");
    await localStore.putBlob("case-photo", "c1", photo());
    await localStore.removeBlobs("case-photo");
    expect(await localStore.getBlob("case-photo", "c1")).toBeUndefined();
  });
});

describe("MOD-local-store clearAll (DELETE-ALL-DATA)", () => {
  it("leaves no register key and no blob", async () => {
    localStore.put("profile", "p", 1);
    localStore.put("materials", "m", 1);
    localStore.put("tools", "t", 1);
    localStore.put("cases", "c", 1);
    giveConsent("keep-case-photos");
    localStorage.setItem("daiy.v1.sync", "{}");
    await localStore.putBlob("case-photo", "c", new Blob(["x"]));
    await localStore.clearAll();
    for (const key of Object.keys(STORAGE_REGISTER)) {
      expect(localStorage.getItem(key)).toBeNull();
    }
    expect(localStorage.length).toBe(0);
    expect(await localStore.getBlob("case-photo", "c")).toBeUndefined();
  });

  it("notifies subscribers of every collection", async () => {
    const listener = vi.fn();
    localStore.subscribe(listener);
    await localStore.clearAll();
    expect(listener.mock.calls.map(([c]) => c).sort()).toEqual([
      "cases",
      "materials",
      "profile",
      "tools",
    ]);
  });
});

describe("MOD-local-store register (DEVICE-STORAGE-CONSENT)", () => {
  it("names a basis for every key the app writes", () => {
    localStore.put("profile", "p", 1);
    localStore.put("materials", "m", 1);
    localStore.put("tools", "t", 1);
    localStore.put("cases", "c", 1);
    giveConsent("keep-case-photos");
    localStorage.setItem("daiy.v1.sync", "{}");
    for (let i = 0; i < localStorage.length; i++) {
      expect(STORAGE_REGISTER).toHaveProperty([localStorage.key(i) as string]);
    }
  });

  it("states the basis of each entry", () => {
    expect(STORAGE_REGISTER["daiy.v1.profile"]).toEqual({
      kind: "necessary",
      for: expect.stringMatching(/\S/),
    });
    expect(STORAGE_REGISTER["case-photo blobs"]).toEqual({
      kind: "consent",
      consent: "keep-case-photos",
    });
    expect(STORAGE_REGISTER["cookie daiy_session"]).toMatchObject({ kind: "necessary" });
  });
});
