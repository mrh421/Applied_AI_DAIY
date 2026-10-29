import { draftExplanation } from "../ai-tasks";
import { schemas } from "../case-model";
import type { ExplainOutcome } from "../case-model";
import { checkExplanationDraft } from "../output-check";
import { logOutcome } from "./log";
import { INVALID_REQUEST_NOTICE, OUTPUT_REJECTED_NOTICE, technicalErrorNotice } from "./notices";

async function pipe(input: unknown): Promise<{ outcome: ExplainOutcome; failures: string[] }> {
  const parsed = schemas.explainRequest.safeParse(input);
  if (!parsed.success) {
    return { outcome: { type: "notice", notice: INVALID_REQUEST_NOTICE }, failures: [] };
  }
  const req = parsed.data;

  let raw: unknown;
  try {
    raw = await draftExplanation(req);
  } catch (e) {
    return { outcome: { type: "notice", notice: technicalErrorNotice(e) }, failures: [] };
  }

  const checked = checkExplanationDraft(raw, req);
  if (!checked.ok) {
    return {
      outcome: { type: "notice", notice: OUTPUT_REJECTED_NOTICE },
      failures: checked.failures.map((f) => f.check),
    };
  }
  return {
    outcome: { type: "explanation", packageId: req.packageId, steps: checked.value.steps },
    failures: [],
  };
}

export async function runExplain(input: unknown): Promise<ExplainOutcome> {
  const { outcome, failures } = await pipe(input);
  logOutcome("explain", outcome.type, failures);
  return outcome;
}
