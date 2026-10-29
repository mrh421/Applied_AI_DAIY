import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CATALOGUE } from "./catalogue";
import { illustration, illustrationIndex } from "./index";

const publicDir = path.resolve(__dirname, "../../public");

describe("illustration catalogue", () => {
  it("has at least one entry", () => {
    expect(CATALOGUE.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = CATALOGUE.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(CATALOGUE.map((e) => [e.id, e] as const))(
    "entry %s has a file, a topic and an alt",
    (_id, e) => {
      expect(existsSync(path.join(publicDir, e.src))).toBe(true);
      expect(e.topic.trim()).not.toBe("");
      expect(e.alt.trim()).not.toBe("");
    },
  );
});

describe("illustrationIndex", () => {
  it("lists id and topic of every entry and nothing else", () => {
    expect(illustrationIndex()).toEqual(CATALOGUE.map((e) => ({ id: e.id, topic: e.topic })));
  });
});

describe("illustration", () => {
  it("returns the entry of a known id", () => {
    const first = CATALOGUE[0]!;
    expect(illustration(first.id)).toEqual(first);
  });

  it("returns undefined for an unknown id", () => {
    expect(illustration("no-such-image")).toBeUndefined();
  });
});
