import { z } from "zod";

import { quantitySchema, factTopicSchema, skillAreaSchema, skillLevelSchema } from "./vocabulary";
import { workPackageSchema } from "./draft";

export const photoInputSchema = z.object({
  mediaType: z.literal("image/jpeg"),
  dataBase64: z.string(),
});
export type PhotoInput = z.infer<typeof photoInputSchema>;

export const answerSchema = z.object({
  questionId: z.string(),
  topic: factTopicSchema,
  text: z.string(),
  notSure: z.boolean(),
});
export type Answer = z.infer<typeof answerSchema>;

export const inventorySnapshotSchema = z.object({
  materials: z.array(z.object({ name: z.string(), quantity: quantitySchema })),
  tools: z.array(z.object({ name: z.string() })),
});
export type InventorySnapshot = z.infer<typeof inventorySnapshotSchema>;

export const caseRequestSchema = z.object({
  description: z.string(),
  photo: photoInputSchema.optional(),
  answers: z.array(answerSchema),
  round: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  inventory: inventorySnapshotSchema,
});
export type CaseRequest = z.infer<typeof caseRequestSchema>;

export const explainRequestSchema = z.object({
  packageId: z.string(),
  area: skillAreaSchema,
  level: skillLevelSchema,
  steps: z.array(z.object({ n: z.number(), text: z.string() })),
  onlyStep: z.number().nullable(),
  simpler: z.boolean(),
});
export type ExplainRequest = z.infer<typeof explainRequestSchema>;

export const stepQuestionRequestSchema = z.object({
  summary: z.string(),
  pkg: workPackageSchema,
  currentStep: z.number(),
  question: z.string(),
});
export type StepQuestionRequest = z.infer<typeof stepQuestionRequestSchema>;
