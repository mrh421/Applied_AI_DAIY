import { schemas } from "../case-model";
import type {
  AssessmentDraft,
  ExplainRequest,
  ExplanationDraft,
  StepAnswerDraft,
} from "../case-model";
import {
  assessmentCompleteness,
  explanationCompleteness,
  stepAnswerCompleteness,
} from "./completeness";
import { basicsLengthFailures, parseFormat, type CheckFailure, type CheckResult } from "./format";
import { assessmentProhibited, explanationProhibited, stepAnswerProhibited } from "./prohibited";

// A draft that fails the format cannot be walked, so later checks run only on a parsed draft.
// Every later check runs, so one result lists all failures.
function verdict<T>(value: T, failures: CheckFailure[]): CheckResult<T> {
  return failures.length === 0 ? { ok: true, value } : { ok: false, failures };
}

export function checkAssessmentDraft(
  raw: unknown,
  ctx: { round: 0 | 1 | 2 },
): CheckResult<AssessmentDraft> {
  const parsed = parseFormat(schemas.assessmentDraft, raw);
  if (!parsed.ok) return parsed;
  const draft = parsed.value;
  return verdict(draft, [
    ...assessmentCompleteness(draft),
    ...assessmentProhibited(draft, ctx.round),
  ]);
}

export function checkExplanationDraft(
  raw: unknown,
  req: ExplainRequest,
): CheckResult<ExplanationDraft> {
  const parsed = parseFormat(schemas.explanationDraft, raw);
  if (!parsed.ok) return parsed;
  const draft = parsed.value;
  return verdict(draft, [
    ...basicsLengthFailures(draft.steps),
    ...explanationCompleteness(draft, req),
    ...explanationProhibited(draft, req),
  ]);
}

export function checkStepAnswerDraft(raw: unknown): CheckResult<StepAnswerDraft> {
  const parsed = parseFormat(schemas.stepAnswerDraft, raw);
  if (!parsed.ok) return parsed;
  const draft = parsed.value;
  return verdict(draft, [...stepAnswerCompleteness(draft), ...stepAnswerProhibited(draft)]);
}
