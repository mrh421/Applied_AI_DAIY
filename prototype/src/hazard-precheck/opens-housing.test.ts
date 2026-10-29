import { describe, expect, it } from "vitest";

import { opensHousing } from "./index";

describe("opensHousing", () => {
  it.each([
    "Remove the cover of the fuse box.",
    "Open the distribution board and look at the labels.",
    "Unscrew the casing of the power supply.",
    "Take apart the toaster and clean the heating wire.",
  ])("is true in English: %s", (text) => expect(opensHousing(text)).toBe(true));

  it.each([
    "Öffnen Sie den Sicherungskasten.",
    "Schrauben Sie das Gehäuse des Netzteils auf.",
    "Das Gehäuse des Wasserkochers öffnen und den Kalk entfernen.",
  ])("is true in German: %s", (text) => expect(opensHousing(text)).toBe(true));

  it.each([
    "Replace the battery in the remote control.",
    "Wipe the casing of the toaster with a damp cloth.",
    "Open the window and let the room air out.",
    "Das Gehäuse der Fernbedienung öffnen und die Batterien tauschen.",
    "",
  ])("is false for a near miss: %s", (text) => expect(opensHousing(text)).toBe(false));
});
