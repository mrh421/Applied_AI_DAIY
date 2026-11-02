import { describe, expect, it } from "vitest";

import { detectHazards } from "../hazard-precheck";
import { draft, guide, pkg, step } from "./fixtures";
import { FIXED_BY_LANGUAGE } from "./fixed";
import { detectLanguage, enforceSafety } from "./index";

describe("detectLanguage", () => {
  it("finds German", () => {
    expect(detectLanguage(["Mein 3D-Drucker ist kaputt und druckt nicht mehr."])).toBe("de");
    expect(detectLanguage(["Der Wasserhahn tropft, ich habe keine Dichtung."])).toBe("de");
    expect(detectLanguage(["Rost abschleifen und für den Zaun mit Wachs schützen"])).toBe("de");
  });
  it("finds English", () => {
    expect(detectLanguage(["My printer is broken and does not print."])).toBe("en");
    expect(detectLanguage(["The tap drips, I have no seal."])).toBe("en");
  });
  it("answers English when the words give no lead", () => {
    expect(detectLanguage([""])).toBe("en");
    expect(detectLanguage(["IKEA PAX 3D"])).toBe("en");
  });
  it("counts the answers with the description", () => {
    expect(detectLanguage(["Printer", "Das Filament ist PLA und der Druck ist schief."])).toBe(
      "de",
    );
  });
});

describe("fixed texts in German", () => {
  it("have the same keys and raise no hazard", () => {
    const { en, de } = FIXED_BY_LANGUAGE;
    expect(Object.keys(de.texts)).toEqual(Object.keys(en.texts));
    expect(Object.keys(de.questions)).toEqual(Object.keys(en.questions));
    for (const t of [de.texts.shutOffWater, de.texts.unplug, de.texts.lockOut]) {
      expect(detectHazards(t)).toEqual([]);
    }
  });

  const device = (guideSteps = [step(1, "Öffne die Abdeckung.", { opensDevice: true })]) =>
    draft({
      device: { concernsDevice: true, modelKnown: false },
      options: [
        {
          id: "o1",
          kind: "repair",
          title: "Reparatur",
          packages: [pkg({ guide: guide(guideSteps) })],
        },
      ],
    });

  it("asks model and variant in German", () => {
    const o = enforceSafety(device(), { round: 0, answers: [], language: "de" });
    if (o.type !== "questions") throw new Error(o.type);
    expect(o.questions[0]!.text).toBe(FIXED_BY_LANGUAGE.de.questions.deviceModel.text);
    expect(o.questions[1]!.text).toBe(FIXED_BY_LANGUAGE.de.questions.deviceVariant.text);
  });
  it("asks in English without a language", () => {
    const o = enforceSafety(device(), { round: 0, answers: [] });
    if (o.type !== "questions") throw new Error(o.type);
    expect(o.questions[0]!.text).toBe(FIXED_BY_LANGUAGE.en.questions.deviceModel.text);
  });
  it("inserts the unplug step in German and not twice, whichever language it is already in", () => {
    const run = (steps: ReturnType<typeof step>[], language: "en" | "de") => {
      const o = enforceSafety(
        { ...device(steps), device: { concernsDevice: false, modelKnown: true } },
        { round: 0, answers: [], language },
      );
      if (o.type !== "guidance") throw new Error(o.type);
      return o.options[0]!.packages[0]!.guide!.steps.map((s) => s.text);
    };
    const opening = step(1, "Öffne die Abdeckung.", { opensDevice: true });
    expect(run([opening], "de")).toEqual([
      FIXED_BY_LANGUAGE.de.texts.unplug,
      "Öffne die Abdeckung.",
    ]);
    const withEnglish = [
      step(1, FIXED_BY_LANGUAGE.en.texts.unplug, { fixedSafetyStep: true }),
      step(2, "Open it.", { opensDevice: true }),
    ];
    expect(
      run(withEnglish, "de").filter((t) => t.startsWith("Unplug") || t.startsWith("Ziehe")),
    ).toHaveLength(1);
  });
  it("adds the German assumption when the model stays unknown", () => {
    const o = enforceSafety(device(), { round: 2, answers: [], language: "de" });
    if (o.type !== "guidance") throw new Error(o.type);
    expect(o.assumptions).toContain(FIXED_BY_LANGUAGE.de.texts.unknownModel);
  });
});
