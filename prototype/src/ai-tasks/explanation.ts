import { generateJson } from "../ai-gateway";
import { schemas } from "../case-model";
import type { ExplainRequest } from "../case-model";
import { STYLE_RULES } from "./style";

function instructions(simpler: boolean): string {
  return [
    "You explain the basics behind steps of a DIY guide. Return only the JSON the schema asks for: one basics text for each requested step, with its number.",
    "- Explain; never change, relax or replace a step or a warning.",
    "- Fit the amount of detail to the skill level given: more for a beginner, less for a more experienced person.",
    ...(simpler
      ? [
          "- Use simpler wording than a normal explanation: shorter words, smaller ideas, one thing at a time.",
        ]
      : []),
    STYLE_RULES,
  ].join("\n");
}

/** Sends exactly the requested steps and the level of one area. */
export function draftExplanation(req: ExplainRequest): Promise<unknown> {
  const steps = req.onlyStep === null ? req.steps : req.steps.filter((s) => s.n === req.onlyStep);
  const text = [
    `Area: ${req.area}`,
    `Skill level: ${req.level}`,
    `Steps:\n${steps.map((s) => `${s.n}. ${s.text}`).join("\n")}`,
  ].join("\n\n");
  return generateJson({
    system: instructions(req.simpler),
    content: [{ type: "text", text }],
    schema: schemas.explanationDraft,
  });
}
