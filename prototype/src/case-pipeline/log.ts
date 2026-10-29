import { PROMPT_VERSION } from "../ai-tasks";

// One log line per call: the prompt version, the model, the outcome type and the failure checks.
// It never holds case text.
export function logOutcome(task: string, outcomeType: string, failureChecks: string[] = []): void {
  console.info(
    JSON.stringify({
      task,
      promptVersion: PROMPT_VERSION,
      model: process.env["AI_MODEL"] ?? null,
      outcome: outcomeType,
      failureChecks,
    }),
  );
}
