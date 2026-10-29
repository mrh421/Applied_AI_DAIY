import { createServerFn } from "@tanstack/react-start";

import type { CaseOutcome, ExplainOutcome, StepAnswerOutcome } from "../case-model";
import { runAssess } from "./assess";
import { runExplain } from "./explain";
import { runStepQuestion } from "./step-question";

// Input is passed on unparsed: each pipe parses it and answers invalid input with a notice,
// so a server function never throws.
const unchecked = (d: unknown) => d;

export const assessCase = createServerFn({ method: "POST" })
  .inputValidator(unchecked)
  .handler(({ data }): Promise<CaseOutcome> => runAssess(data));

export const explainSteps = createServerFn({ method: "POST" })
  .inputValidator(unchecked)
  .handler(({ data }): Promise<ExplainOutcome> => runExplain(data));

export const answerStepQuestion = createServerFn({ method: "POST" })
  .inputValidator(unchecked)
  .handler(({ data }): Promise<StepAnswerOutcome> => runStepQuestion(data));
