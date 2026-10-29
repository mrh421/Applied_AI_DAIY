import { FIXED_TOPICS } from "../case-model";
import type { FollowUpQuestion } from "../case-model";

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

export const FIXED_QUESTIONS: Record<
  "deviceModel" | "deviceVariant" | "furnitureLoad" | "furnitureDimensions",
  FollowUpQuestion
> = {
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
