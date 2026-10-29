import type { ZodType } from "zod";

import { assessmentDraftSchema, explanationDraftSchema, stepAnswerDraftSchema } from "./draft";
import type { AssessmentDraft, ExplanationDraft, StepAnswerDraft } from "./draft";
import { caseRequestSchema, explainRequestSchema, stepQuestionRequestSchema } from "./request";
import type { CaseRequest, ExplainRequest, StepQuestionRequest } from "./request";

export { FIXED_TOPICS, LABEL_STRICTNESS, SAFETY_RULES_VERSION, SKILL_AREAS } from "./vocabulary";
export type {
  FactTopic,
  HazardKind,
  Money,
  NoticeKind,
  PackageLabel,
  Quantity,
  RiskLevel,
  SkillArea,
  SkillLevel,
  Unit,
} from "./vocabulary";
export type {
  Answer,
  CaseRequest,
  ExplainRequest,
  InventorySnapshot,
  PhotoInput,
  StepQuestionRequest,
} from "./request";
export type {
  AssessmentDraft,
  ExplanationDraft,
  FollowUpQuestion,
  Guide,
  MaterialNeed,
  OptionKind,
  PackageFlags,
  PartSpec,
  SolutionOption,
  Step,
  StepAnswerDraft,
  ToolNeed,
  WorkPackage,
} from "./draft";
export type {
  CaseOutcome,
  Escalation,
  ExplainOutcome,
  Notice,
  StepAnswerOutcome,
  UserNotice,
} from "./outcome";
export { rankOptions, stricterLabel } from "./ordering";

export const schemas: {
  caseRequest: ZodType<CaseRequest>;
  assessmentDraft: ZodType<AssessmentDraft>;
  explainRequest: ZodType<ExplainRequest>;
  explanationDraft: ZodType<ExplanationDraft>;
  stepQuestionRequest: ZodType<StepQuestionRequest>;
  stepAnswerDraft: ZodType<StepAnswerDraft>;
} = {
  caseRequest: caseRequestSchema,
  assessmentDraft: assessmentDraftSchema,
  explainRequest: explainRequestSchema,
  explanationDraft: explanationDraftSchema,
  stepQuestionRequest: stepQuestionRequestSchema,
  stepAnswerDraft: stepAnswerDraftSchema,
};
