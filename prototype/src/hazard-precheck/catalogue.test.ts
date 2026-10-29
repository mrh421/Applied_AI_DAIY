import { describe, expect, it } from "vitest";

import type { HazardKind } from "../case-model";
import { detectHazards } from "./index";

// One entry per kind: an English and a German positive and a near miss that must not match.
const kinds: [HazardKind, string, string, string][] = [
  [
    "gas",
    "It smells a bit like gas near my stove",
    "Es gibt Gasgeruch in der Küche",
    "My office chair sinks, I think the gas lift is broken",
  ],
  [
    "carbon-monoxide",
    "The CO alarm next to the boiler keeps beeping",
    "Der CO-Melder im Flur piept",
    "I need a new alarm clock",
  ],
  [
    "fire-or-smoke",
    "There is smoke coming out of the toaster",
    "Es riecht verbrannt und es gibt Rauch",
    "Replace the battery of the smoke detector",
  ],
  [
    "overheating-electrics",
    "The socket is black and gets hot",
    "Die Steckdose im Bad ist verschmort und wird warm",
    "My black HDMI cable is too short for the TV",
  ],
  [
    "water-near-electrics",
    "Water got into the socket in the bathroom",
    "Wasser ist in die Steckdose gelaufen",
    "I want to add a socket next to the mirror",
  ],
  [
    "water-leak-in-wall",
    "Water is leaking where the pipe goes into the wall",
    "Die Wand ist nass und tropft",
    "I want to remove the old wallpaper from the wall",
  ],
  [
    "structural-damage",
    "There is a structural crack above the door",
    "Die Decke hängt durch",
    "There is a hairline crack in the plaster",
  ],
  [
    "distribution-board",
    "I want to add a fuse to the distribution board",
    "Der Sicherungskasten ist alt und soll getauscht werden",
    "I want to hang a shelf in the hallway",
  ],
  [
    "fixed-installation",
    "I want to install a new circuit in the hallway",
    "Ich will eine neue Drehstromleitung verlegen",
    "I want to add a ceiling light",
  ],
  [
    "grid-connection",
    "I want to move my grid connection to the other wall",
    "Ich möchte den Hausanschluss verlegen",
    "I want a wallbox in the garage",
  ],
  [
    "gas-installation",
    "I want to connect a new gas stove to the gas pipe",
    "Ich will den Gasherd an die Gasleitung anschließen",
    "How do I clean the burners of my stove?",
  ],
  [
    "refrigerant-circuit",
    "How do I refill the refrigerant of my air conditioner?",
    "Ich will Kältemittel nachfüllen",
    "My fridge door does not close",
  ],
  [
    "load-bearing-structure",
    "I want to remove the wall between kitchen and living room",
    "Ich möchte die tragende Wand entfernen",
    "I want to remove the shelf from the wall",
  ],
  [
    "chimney",
    "The chimney needs a new flue liner",
    "Der Schornstein soll gekürzt werden",
    "I need an appointment with the chimney sweep",
  ],
  [
    "energy-renovation",
    "We plan a full energy renovation of our house",
    "Wir planen eine energetische Sanierung des ganzen Hauses",
    "I want to insulate the accessible attic floor",
  ],
];

describe("hazard catalogue", () => {
  it.each(kinds)("%s is detected in English", (kind, en) =>
    expect(detectHazards(en)).toContain(kind),
  );
  it.each(kinds)("%s is detected in German", (kind, _en, de) =>
    expect(detectHazards(de)).toContain(kind),
  );
  it.each(kinds)("%s is not detected in a near miss", (kind, _en, _de, miss) =>
    expect(detectHazards(miss)).not.toContain(kind),
  );
});
