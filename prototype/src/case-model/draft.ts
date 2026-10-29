import { z } from "zod";

import {
  factTopicSchema,
  hazardKindSchema,
  noticeKindSchema,
  packageLabelSchema,
  quantitySchema,
  riskLevelSchema,
  skillAreaSchema,
} from "./vocabulary";

export const followUpQuestionSchema = z.object({
  id: z.string(),
  topic: factTopicSchema,
  text: z.string(),
  termExplanations: z.array(z.object({ term: z.string(), explanation: z.string() })),
  prefill: z.string().optional(),
});
export type FollowUpQuestion = z.infer<typeof followUpQuestionSchema>;

export const partSpecSchema = z.object({
  dimensionsMm: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      diameter: z.number().optional(),
    })
    .optional(),
  material: z.string().optional(),
  function: z.string().optional(),
});
export type PartSpec = z.infer<typeof partSpecSchema>;

export const materialNeedSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: quantitySchema,
  spec: partSpecSchema,
  replacementPart: z.boolean(),
  safetyCritical: z.enum(["yes", "no", "unclear"]),
  printable: z.boolean(),
});
export type MaterialNeed = z.infer<typeof materialNeedSchema>;

export const toolNeedSchema = z.object({
  id: z.string(),
  name: z.string(),
  rentable: z.boolean(),
});
export type ToolNeed = z.infer<typeof toolNeedSchema>;

export const stepSchema = z.object({
  n: z.number(),
  text: z.string(),
  opensDevice: z.boolean(),
  switchesOffCircuit: z.boolean(),
  fixedSafetyStep: z.boolean(),
  imageIds: z.array(z.string()),
});
export type Step = z.infer<typeof stepSchema>;

export const guideSchema = z.object({
  diagnosis: z.string(),
  tools: z.array(toolNeedSchema),
  materials: z.array(materialNeedSchema),
  steps: z.array(stepSchema),
  estimatedMinutes: z.object({ min: z.number(), max: z.number() }),
  warnings: z.array(z.string()),
});
export type Guide = z.infer<typeof guideSchema>;

export const packageFlagsSchema = z.object({
  opensMainsHousing: z.boolean(),
  carriesPerson: z.boolean(),
  waterRelated: z.boolean(),
});
export type PackageFlags = z.infer<typeof packageFlagsSchema>;

export const workPackageSchema = z.object({
  id: z.string(),
  title: z.string(),
  area: skillAreaSchema,
  label: packageLabelSchema,
  alternativeLabel: packageLabelSchema.optional(),
  reason: z.string(),
  labelUncertain: z.boolean(),
  decidingInformation: z.array(z.string()),
  handoverBrief: z.string(),
  agreeBeforehand: z.string().optional(),
  flags: packageFlagsSchema,
  guide: guideSchema.optional(),
});
export type WorkPackage = z.infer<typeof workPackageSchema>;

export const optionKindSchema = z.enum(["repair", "reuse", "buy-new"]);
export type OptionKind = z.infer<typeof optionKindSchema>;

export const solutionOptionSchema = z.object({
  id: z.string(),
  kind: optionKindSchema,
  title: z.string(),
  packages: z.array(workPackageSchema),
});
export type SolutionOption = z.infer<typeof solutionOptionSchema>;

export const assessmentDraftSchema = z.object({
  kind: z.enum(["questions", "answer"]),
  missing: z.array(z.string()),
  questions: z.array(followUpQuestionSchema),
  device: z.object({ concernsDevice: z.boolean(), modelKnown: z.boolean() }),
  outOfScope: hazardKindSchema.nullable(),
  risk: riskLevelSchema,
  riskUncertain: z.boolean(),
  hazards: z.array(hazardKindSchema),
  summary: z.string(),
  photoDescription: z.string().nullable(),
  assumptions: z.array(z.string()),
  options: z.array(solutionOptionSchema),
  notices: z.array(
    z.object({ kind: noticeKindSchema, certainty: z.enum(["applies", "possible"]) }),
  ),
});
export type AssessmentDraft = z.infer<typeof assessmentDraftSchema>;

export const explanationDraftSchema = z.object({
  steps: z.array(z.object({ n: z.number(), basics: z.string() })),
});
export type ExplanationDraft = z.infer<typeof explanationDraftSchema>;

export const stepAnswerDraftSchema = z.object({
  answer: z.string(),
  risk: riskLevelSchema,
  hazards: z.array(hazardKindSchema),
});
export type StepAnswerDraft = z.infer<typeof stepAnswerDraftSchema>;
