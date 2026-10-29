import { generateJson } from "../ai-gateway";
import type { AiContent } from "../ai-gateway";
import { schemas } from "../case-model";
import type { CaseRequest } from "../case-model";
import { illustrationIndex } from "../illustrations";
import { STYLE_RULES } from "./style";

const ROUND_2_RULE =
  "This is the last round. Do not ask any questions. List what is still unknown as assumptions instead.";

function instructions(round: CaseRequest["round"]): string {
  return [
    "You help a person solve a repair problem or a small DIY project. Return only the JSON the schema asks for.",
    "- Summarise the problem so the person can follow it.",
    "- Name what information is missing. Ask for it in follow-up questions (set each question's topic), in everyday language.",
    "- If the case concerns a device, ask for its model and variant before you name any part.",
    "- Never present an assumption as a fact. List assumptions as assumptions.",
    "- Set the risk, the hazards, the flags and the kinds of the schema honestly. Use the inventory to prefer what the person already owns.",
    "- Split a project with several tasks into work packages. Give each package one label, a short reason and a handover brief for a professional.",
    "- If a label is uncertain, choose the stricter label, set labelUncertain and state the deciding information that would change it.",
    "- Reference illustrations only by ids from the illustration index.",
    ...(round === 2 ? [ROUND_2_RULE] : []),
    STYLE_RULES,
  ].join("\n");
}

function lines(items: string[]): string {
  return items.length ? items.join("\n") : "(none)";
}

function render(req: CaseRequest): string {
  const answers = req.answers.map((a) => `- [${a.topic}] ${a.notSure ? "(not sure)" : a.text}`);
  const materials = req.inventory.materials.map(
    (m) => `- ${m.name}: ${m.quantity.amount} ${m.quantity.unit}`,
  );
  const tools = req.inventory.tools.map((t) => `- ${t.name}`);
  const images = illustrationIndex().map((i) => `- ${i.id}: ${i.topic}`);
  return [
    `Description:\n${req.description}`,
    `Question round: ${req.round}`,
    `Answers so far:\n${lines(answers)}`,
    `Inventory, materials:\n${lines(materials)}`,
    `Inventory, tools:\n${lines(tools)}`,
    `Illustration index:\n${lines(images)}`,
  ].join("\n\n");
}

/** Sends the case, never a skill profile (ARC-011), and returns the unvalidated draft. */
export function draftAssessment(req: CaseRequest): Promise<unknown> {
  const content: AiContent[] = [{ type: "text", text: render(req) }];
  if (req.photo) content.push({ type: "image", ...req.photo });
  return generateJson({
    system: instructions(req.round),
    content,
    schema: schemas.assessmentDraft,
  });
}
