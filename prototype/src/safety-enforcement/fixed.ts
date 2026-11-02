import { FIXED_TOPICS } from "../case-model";
import type { FollowUpQuestion } from "../case-model";
import type { Language } from "../hazard-precheck";

export type FixedTexts = { [K in keyof typeof FIXED_TEXTS]: string };

export const FIXED_TEXTS = {
  shutOffWater:
    "Shut off the water supply first: close the stop valve of this fitting or the main water valve, then open the tap to let the pressure out.",
  unplug:
    "Unplug the device from the mains socket and wait until it is fully off before you open it.",
  lockOut:
    "Switching off a circuit breaker is not enough to make a circuit safe. Someone could switch it on again. Secure it against being switched on again, for example with a lock or a sign on the breaker, and leave anything that needs more than this to a qualified electrician.",
  agreeBeforehand:
    "Agree this preparation with the professional beforehand. Do not start it before they have said what they want done and how.",
  unknownModel:
    "The exact model and variant of the device are unknown, so no replacement part is named. Check the model and variant on the rating plate before you buy any part.",
  loadDeciding: "The load the furniture has to carry",
  dimensionsDeciding: "The dimensions of the furniture",
} as const;

type FixedQuestions = Record<
  "deviceModel" | "deviceVariant" | "furnitureLoad" | "furnitureDimensions",
  FollowUpQuestion
>;

export const FIXED_QUESTIONS: FixedQuestions = {
  deviceModel: {
    id: "fixed-device-model",
    topic: FIXED_TOPICS.deviceModel,
    text: "What is the exact model of the device? You usually find it on the rating plate.",
    termExplanations: [
      {
        term: "rating plate",
        explanation: "A small label on the device with its model name and numbers.",
      },
    ],
  },
  deviceVariant: {
    id: "fixed-device-variant",
    topic: FIXED_TOPICS.deviceVariant,
    text: "Which variant or version is it? The rating plate often shows a type or serial number.",
    termExplanations: [],
  },
  furnitureLoad: {
    id: "fixed-furniture-load",
    topic: FIXED_TOPICS.furnitureLoad,
    text: "How much weight must the furniture carry, for example how heavy is the person who uses it?",
    termExplanations: [],
  },
  furnitureDimensions: {
    id: "fixed-furniture-dimensions",
    topic: FIXED_TOPICS.furnitureDimensions,
    text: "What are the dimensions of the furniture (length, width and height)?",
    termExplanations: [],
  },
};

/** The German fixed texts: the same rules, worded for a person who writes in German. */
const FIXED_TEXTS_DE: FixedTexts = {
  shutOffWater:
    "Stelle zuerst das Wasser ab: Schließe das Absperrventil dieser Armatur oder den Haupthahn und öffne dann den Wasserhahn, damit der Druck entweichen kann.",
  unplug: "Ziehe den Netzstecker des Geräts und warte, bis es ganz aus ist, bevor du es öffnest.",
  lockOut:
    "Eine ausgeschaltete Sicherung reicht nicht, damit die Leitung sicher ist. Jemand könnte sie wieder einschalten. Sichere sie gegen Wiedereinschalten, zum Beispiel mit einem Schloss oder einem Schild an der Sicherung, und überlasse alles, was mehr als das braucht, einer Elektrofachkraft.",
  agreeBeforehand:
    "Sprich diese Vorbereitung vorher mit der Fachperson ab. Beginne nicht damit, bevor sie gesagt hat, was sie erledigt haben möchte und wie.",
  unknownModel:
    "Das genaue Modell und die Variante des Geräts sind unbekannt, deshalb wird kein Ersatzteil genannt. Prüfe Modell und Variante auf dem Typenschild, bevor du ein Teil kaufst.",
  loadDeciding: "Die Last, die das Möbelstück tragen muss",
  dimensionsDeciding: "Die Maße des Möbelstücks",
};

const FIXED_QUESTIONS_DE: FixedQuestions = {
  deviceModel: {
    id: "fixed-device-model",
    topic: FIXED_TOPICS.deviceModel,
    text: "Wie lautet das genaue Modell des Geräts? Du findest es meist auf dem Typenschild.",
    termExplanations: [
      {
        term: "Typenschild",
        explanation: "Ein kleines Schild am Gerät mit seinem Modellnamen und Nummern.",
      },
    ],
  },
  deviceVariant: {
    id: "fixed-device-variant",
    topic: FIXED_TOPICS.deviceVariant,
    text: "Welche Variante oder Version ist es? Auf dem Typenschild steht oft ein Typ oder eine Seriennummer.",
    termExplanations: [],
  },
  furnitureLoad: {
    id: "fixed-furniture-load",
    topic: FIXED_TOPICS.furnitureLoad,
    text: "Wie viel Gewicht muss das Möbelstück tragen, zum Beispiel wie schwer ist die Person, die es benutzt?",
    termExplanations: [],
  },
  furnitureDimensions: {
    id: "fixed-furniture-dimensions",
    topic: FIXED_TOPICS.furnitureDimensions,
    text: "Wie groß ist das Möbelstück (Länge, Breite und Höhe)?",
    termExplanations: [],
  },
};

/** The language of the fixed texts: the language the person writes in. */
export type FixedLanguage = Language;

export const FIXED_BY_LANGUAGE: Record<
  FixedLanguage,
  { texts: FixedTexts; questions: FixedQuestions }
> = {
  en: { texts: FIXED_TEXTS, questions: FIXED_QUESTIONS },
  de: { texts: FIXED_TEXTS_DE, questions: FIXED_QUESTIONS_DE },
};

/** True when `text` is the fixed text `key` in any language (the guard against inserting it twice). */
export function isFixedText(key: keyof FixedTexts, text: string): boolean {
  return Object.values(FIXED_BY_LANGUAGE).some((f) => f.texts[key] === text);
}
