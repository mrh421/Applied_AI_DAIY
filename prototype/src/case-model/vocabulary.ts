import { z } from "zod";

export const SKILL_AREAS = [
  "plumbing",
  "electrical-devices",
  "woodwork",
  "walls-and-floors",
  "furniture",
  "garden",
  "bikes",
  "textiles",
  "other",
] as const;
export const skillAreaSchema = z.enum(SKILL_AREAS);
export type SkillArea = z.infer<typeof skillAreaSchema>;

export const skillLevelSchema = z.enum(["beginner", "some-experience", "experienced"]);
export type SkillLevel = z.infer<typeof skillLevelSchema>;

export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

/** Least to most restrictive. */
export const LABEL_STRICTNESS = [
  "diy",
  "diy-preparation",
  "professional-only",
  "not-recommended",
] as const;
export const packageLabelSchema = z.enum(LABEL_STRICTNESS);
export type PackageLabel = z.infer<typeof packageLabelSchema>;

/** Raised with every change of the hazard catalogue, the enforcement rules or the fixed texts. */
export const SAFETY_RULES_VERSION = "1";

export const unitSchema = z.enum(["piece", "mm", "cm", "m", "m2", "ml", "l", "g", "kg"]);
export type Unit = z.infer<typeof unitSchema>;

export const quantitySchema = z.object({ amount: z.number(), unit: unitSchema });
export type Quantity = z.infer<typeof quantitySchema>;

export const moneySchema = z.object({ amount: z.number(), currency: z.literal("EUR") });
export type Money = z.infer<typeof moneySchema>;

export const hazardKindSchema = z.enum([
  "gas",
  "carbon-monoxide",
  "fire-or-smoke",
  "overheating-electrics",
  "water-near-electrics",
  "water-leak-in-wall",
  "structural-damage",
  "distribution-board",
  "fixed-installation",
  "grid-connection",
  "gas-installation",
  "refrigerant-circuit",
  "load-bearing-structure",
  "chimney",
  "energy-renovation",
]);
export type HazardKind = z.infer<typeof hazardKindSchema>;

export const noticeKindSchema = z.enum([
  "location-dependent-rule",
  "permit-free",
  "heating-or-flue-change",
  "heating-or-flue-decommission",
  "firing-installation",
  "planting-near-boundary",
  "boundary-installation",
  "rented-property",
  "tenant-modification-right",
  "warranty-or-funding",
]);
export type NoticeKind = z.infer<typeof noticeKindSchema>;

/** The topic a question asks about, by which answers are filled in again. */
export const factTopicSchema = z.string();
export type FactTopic = z.infer<typeof factTopicSchema>;

export const FIXED_TOPICS = {
  deviceModel: "device.model",
  deviceVariant: "device.variant",
  furnitureLoad: "furniture.load",
  furnitureDimensions: "furniture.dimensions",
} as const;
