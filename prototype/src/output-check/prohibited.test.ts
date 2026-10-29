import { describe, expect, it } from "vitest";

import { findProhibitedClaims, PROHIBITED_CLAIMS } from "./prohibited";

type Cases = [hits: string[], nearMisses: string[]];

// Each row: texts that must match, and near-miss texts that must not.
const table: Record<string, { en: Cases; de: Cases }> = {
  "breaker-alone": {
    en: [
      [
        "Just switch off the circuit breaker and you can work safely.",
        "The circuit breaker alone is enough.",
      ],
      [
        "Switch off the circuit breaker and secure it against being switched on again.",
        "A circuit breaker alone is not enough.",
        "Switching off the breaker is not sufficient on its own.",
      ],
    ],
    de: [
      [
        "Schalte einfach die Sicherung aus, dann ist alles sicher.",
        "Der Leitungsschutzschalter allein reicht.",
      ],
      [
        "Schalte die Sicherung aus und sichere sie gegen Wiedereinschalten.",
        "Die Sicherung allein reicht nicht.",
      ],
    ],
  },
  "permit-free": {
    en: [
      [
        "The shed is permit-free, so no other rules apply.",
        "No building permit is needed and you are free of other requirements.",
      ],
      [
        "No building permit is needed, but other rules still apply.",
        "Permit-free does not mean free of other requirements.",
      ],
    ],
    de: [
      [
        "Der Schuppen ist genehmigungsfrei, es gelten keine weiteren Vorschriften.",
        "Keine Baugenehmigung nötig, also keine anderen Regeln.",
      ],
      [
        "Keine Baugenehmigung nötig, aber andere Vorschriften gelten weiterhin.",
        "Genehmigungsfrei heißt nicht frei von anderen Vorschriften.",
      ],
    ],
  },
  "co2-without-source": {
    en: [
      ["Repairing saves 12 kg CO₂.", "You avoid about 3 kg of CO2 compared with a new one."],
      [
        "Repairing saves 12 kg CO₂ (source: https://example.org/study).",
        "Repairing saves material because no new part is made.",
        "CO₂ is released when new parts are produced.",
      ],
    ],
    de: [
      ["Die Reparatur spart 12 kg CO₂ ein.", "Das vermeidet etwa 3 kg CO2."],
      [
        "Die Reparatur spart 12 kg CO₂ ein (Quelle: Umweltbundesamt).",
        "Reparieren spart Material, weil kein neues Teil entsteht.",
      ],
    ],
  },
  "skip-by-skill": {
    en: [
      [
        "Experienced users can skip this step.",
        "You may safely skip the warnings.",
        "The safety steps are optional.",
      ],
      [
        "Even experienced users must not skip this step.",
        "Never skip the safety steps.",
        "You can skip the sanding if the surface is smooth.",
      ],
    ],
    de: [
      [
        "Erfahrene Nutzer können diesen Schritt überspringen.",
        "Du kannst die Warnhinweise weglassen.",
      ],
      [
        "Auch erfahrene Nutzer dürfen diesen Schritt nicht überspringen.",
        "Überspringe niemals die Sicherheitsschritte.",
      ],
    ],
  },
  "no-need-to-isolate": {
    en: [
      ["There is no need to switch off the power.", "You don't need to unplug the device first."],
      [
        "There is no need to hurry. Switch off the power first.",
        "You need to unplug the device first.",
      ],
    ],
    de: [
      [
        "Es ist nicht nötig, den Strom abzuschalten.",
        "Du musst den Stecker nicht ziehen.",
        "Du brauchst nichts abzuschalten.",
      ],
      [
        "Es ist nicht nötig, sich zu beeilen. Schalte den Strom ab.",
        "Du musst den Stecker ziehen.",
      ],
    ],
  },
  "open-mains-housing": {
    en: [
      ["Open the distribution board and tighten the terminals.", "Next, open your fuse box."],
      [
        "Do not open the distribution board.",
        "An electrician opens the fuse box and replaces the fuse.",
        "Open the toolbox.",
      ],
    ],
    de: [
      [
        "Öffne den Sicherungskasten und ziehe die Klemmen nach.",
        "Den Verteilerkasten öffnen und die Sicherung wechseln.",
      ],
      [
        "Öffne niemals den Sicherungskasten.",
        "Der Elektriker öffnet den Verteilerkasten.",
        "Öffne den Werkzeugkasten.",
      ],
    ],
  },
};

describe("PROHIBITED_CLAIMS", () => {
  it("is a closed table with the six patterns of the module's data", () => {
    expect(PROHIBITED_CLAIMS.map((row) => row.id).sort()).toEqual(Object.keys(table).sort());
  });

  it("names a requirement for every row", () => {
    for (const row of PROHIBITED_CLAIMS) expect(row.requirements.length).toBeGreaterThan(0);
  });
});

describe.each(Object.entries(table))("%s", (id, { en, de }) => {
  describe.each([
    ["English", en],
    ["German", de],
  ] as const)("%s", (_language, [hits, misses]) => {
    it.each(hits)("matches: %s", (text) => {
      expect(findProhibitedClaims(text).map((row) => row.id)).toContain(id);
    });

    it.each(misses)("does not match: %s", (text) => {
      expect(findProhibitedClaims(text).map((row) => row.id)).not.toContain(id);
    });
  });
});
