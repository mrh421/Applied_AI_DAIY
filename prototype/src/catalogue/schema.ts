import { z } from "zod";

export type Certainty = "verified" | "ai-estimate" | "unverified";

/** A datum with its certainty label. A verified datum names its source (VERIFIED-DATA-SOURCE). */
export function datumSchema<T extends z.ZodTypeAny>(value: T) {
  return z.union([
    z.object({ certainty: z.literal("verified"), value, source: z.string().min(1) }).strict(),
    z
      .object({
        certainty: z.enum(["ai-estimate", "unverified"]),
        value: value.nullable(),
      })
      .strict(),
  ]);
}

export type Datum<T> =
  | { certainty: "verified"; value: T; source: string }
  | { certainty: "ai-estimate" | "unverified"; value: T | null };

const quantity = z.object({
  amount: z.number().positive(),
  unit: z.enum(["piece", "mm", "cm", "m", "m2", "ml", "l", "g", "kg"]),
});
const money = z.object({ amount: z.number().nonnegative(), currency: z.literal("EUR") });
const dimensions = z.object({
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  diameter: z.number().positive().optional(),
});
const httpsUrl = z.string().url().startsWith("https://");

export const offerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  condition: z.enum(["new", "second-hand"]),
  unitPrice: datumSchema(money),
  packSize: quantity,
  spec: z.object({
    dimensionsMm: datumSchema(dimensions),
    material: datumSchema(z.string().min(1)),
    function: datumSchema(z.string().min(1)),
  }),
  compatibility: datumSchema(z.literal("fits")),
  availability: datumSchema(z.enum(["in-stock", "limited", "out-of-stock"])),
  dataAsOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: z.object({ name: z.string().min(1), url: httpsUrl }),
  sellerUrl: httpsUrl,
  sustainabilityReason: z.string().min(1).nullable(),
});
export type Offer = z.infer<typeof offerSchema>;

export const modelEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  spec: z.object({
    dimensionsMm: dimensions.optional(),
    material: z.string().optional(),
    function: z.string().optional(),
  }),
  dimensionsMm: dimensions,
  materialRequirements: z.string().min(1),
  licence: z.string().min(1),
  intendedUse: z.string().min(1),
  url: httpsUrl,
  provider: z.string().min(1),
});
export type ModelEntry = z.infer<typeof modelEntrySchema>;
