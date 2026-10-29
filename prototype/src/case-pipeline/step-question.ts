import { draftStepAnswer } from "../ai-tasks";
import { schemas } from "../case-model";
import type { StepAnswerOutcome } from "../case-model";
import { precheck } from "../hazard-precheck";
import { checkStepAnswerDraft } from "../output-check";
import { enforceStepAnswer } from "../safety-enforcement";
import { logOutcome } from "./log";
import { INVALID_REQUEST_NOTICE, OUTPUT_REJECTED_NOTICE, technicalErrorNotice } from "./notices";

async function pipe(input: unknown): Promise<{ outcome: StepAnswerOutcome; failures: string[] }> {
  const parsed = schemas.stepQuestionRequest.safeParse(input);
  if (!parsed.success) {
    return { outcome: { type: "notice", notice: INVALID_REQUEST_NOTICE }, failures: [] };
  }
  const req = parsed.data;

  const escalation = precheck([req.question]);
  if (escalation) return { outcome: { type: "escalation", escalation }, failures: [] };

  let raw: unknown;
  try {
    raw = await draftStepAnswer(req);
  } catch (e) {
    return { outcome: { type: "notice", notice: technicalErrorNotice(e) }, failures: [] };
  }

  const checked = checkStepAnswerDraft(raw);
  if (checked.ok) return { outcome: enforceStepAnswer(checked.value), failures: [] };

  const failures = checked.failures.map((f) => f.check);
  // As for the assessment: a failed draft of high risk is enforced, not turned into a notice.
  const readable = failures.includes("format") ? null : schemas.stepAnswerDraft.safeParse(raw);
  if (readable?.success && (readable.data.risk === "high" || readable.data.risk === "critical")) {
    return { outcome: enforceStepAnswer(readable.data), failures };
  }
  return { outcome: { type: "notice", notice: OUTPUT_REJECTED_NOTICE }, failures };
}

export async function runStepQuestion(input: unknown): Promise<StepAnswerOutcome> {
  const { outcome, failures } = await pipe(input);
  logOutcome("step-question", outcome.type, failures);
  return outcome;
}
