import { describe, expect, it } from "vitest";

import { scaledSize, toPhotoInput } from "./photo";

describe("photo downscaling (ARC-015)", () => {
  it("keeps a small photo as it is", () => {
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
  });
  it("limits the long side to 1600 pixels, keeping the ratio", () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(scaledSize(3000, 6000)).toEqual({ width: 800, height: 1600 });
  });
  it("encodes a blob as a JPEG photo input without the data-url prefix", async () => {
    const input = await toPhotoInput(new Blob(["abc"], { type: "image/jpeg" }));
    expect(input).toEqual({ mediaType: "image/jpeg", dataBase64: btoa("abc") });
  });
});
