import { generateJson } from "../ai-gateway";
import { schemas } from "../case-model";
import type { StepQuestionRequest } from "../case-model";
import { STYLE_RULES } from "./style";

const INSTRUCTIONS = [
  "You answer a question a person asks while carrying out one step of a DIY guide. Return only the JSON the schema asks for.",
  "- Answer in the context of the current step and the package.",
  "- Set the risk and the hazards honestly. If the question reveals a danger, say so and do not give instructions for it.",
  STYLE_RULES,
].join("\n");

/** Sends the package, the current step and the question. */
export function draftStepAnswer(req: StepQuestionRequest): Promise<unknown> {
  const steps = req.pkg.guide?.steps.map((s) => `${s.n}. ${s.text}`).join("\n") ?? "(no guide)";
  const text = [
    `Problem: ${req.summary}`,
    `Package: ${req.pkg.title} (${req.pkg.area}, label ${req.pkg.label})`,
    `Steps:\n${steps}`,
    `Current step: ${req.currentStep}`,
    `Question:\n${req.question}`,
  ].join("\n\n");
  return generateJson({
    system: INSTRUCTIONS,
    content: [{ type: "text", text }],
    schema: schemas.stepAnswerDraft,
  });
}
