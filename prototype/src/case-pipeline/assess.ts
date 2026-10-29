import { draftAssessment } from "../ai-tasks";
import { rankOptions, schemas } from "../case-model";
import type { CaseOutcome } from "../case-model";
import { precheck } from "../hazard-precheck";
import { noticesFor } from "../legal-notices";
import { checkAssessmentDraft } from "../output-check";
import { enforceSafety } from "../safety-enforcement";
import { logOutcome } from "./log";
import { INVALID_REQUEST_NOTICE, OUTPUT_REJECTED_NOTICE, technicalErrorNotice } from "./notices";

// The pipe of an assessment: pre-check, AI draft, output check, enforcement, finishing.
async function pipe(input: unknown): Promise<{ outcome: CaseOutcome; failures: string[] }> {
  const parsed = schemas.caseRequest.safeParse(input);
  if (!parsed.success) {
    return { outcome: { type: "notice", notice: INVALID_REQUEST_NOTICE }, failures: [] };
  }
  const req = parsed.data;

  const escalation = precheck([req.description, ...req.answers.map((a) => a.text)]);
  if (escalation) return { outcome: { type: "escalation", escalation }, failures: [] };

  let raw: unknown;
  try {
    raw = await draftAssessment(req);
  } catch (e) {
    return { outcome: { type: "notice", notice: technicalErrorNotice(e) }, failures: [] };
  }

  const checked = checkAssessmentDraft(raw, { round: req.round });
  const ctx = { round: req.round, answers: req.answers };
  let draft;
  if (checked.ok) {
    draft = checked.value;
  } else {
    const failures = checked.failures.map((f) => f.check);
    // A draft of high risk that passed the format goes to enforcement, so the user gets the
    // escalation and not only a notice to retry.
    const readable = failures.includes("format") ? null : schemas.assessmentDraft.safeParse(raw);
    if (readable?.success && (readable.data.risk === "high" || readable.data.risk === "critical")) {
      return { outcome: enforceSafety(readable.data, ctx), failures };
    }
    return { outcome: { type: "notice", notice: OUTPUT_REJECTED_NOTICE }, failures };
  }

  const outcome = enforceSafety(draft, ctx);
  if (outcome.type !== "guidance") return { outcome, failures: [] };
  return {
    outcome: {
      ...outcome,
      options: rankOptions(outcome.options),
      notices: noticesFor(draft.notices),
    },
    failures: [],
  };
}

export async function runAssess(input: unknown): Promise<CaseOutcome> {
  const { outcome, failures } = await pipe(input);
  logOutcome("assess", outcome.type, failures);
  return outcome;
}
