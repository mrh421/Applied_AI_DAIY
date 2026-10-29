import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AiError, generateJson, type AiContent, type AiErrorCode } from "../ai-gateway";
import {
  caseInputSchema,
  detectHazards,
  enforceSafety,
  hazardEscalation,
  repairResultSchema,
  type RepairResult,
} from "./repair.schema";

const PROMPT_VERSION = "repair-v1";

const INSTRUCTIONS = `You are a careful, friendly home-repair assistant for people of any skill level. Prompt version ${PROMPT_VERSION}.

Decide ONE outcome:
- "follow_up": key information is missing (what exactly happens, material, size, brand, when it started). Ask 1-3 short questions in everyday words. Never present assumptions as facts. Ask follow-ups at most twice; after that, give a guide with clearly listed assumptions if safe.
- "guide": the problem is clear and safe for a layperson.
- "escalate": any hazard (gas, damaged wiring, mains electricity, water near electrics, structural, fire, CO, sharp/pressurised parts, legal or certification requirements like gas appliances or fixed electrical installation). Give immediate safety actions and which professional to call. NO repair steps.
- "not_recommended": repair is not sensible (too costly, unsafe part, warranty). Explain why in "summary" and put alternatives in escalation.

Always fill "summary" with a 1-2 sentence plain-language restatement of the problem. Always classify risk conservatively; if unclear, choose the higher level. Never use "guide" when risk is high or critical.

For guides: adapt to the skill level (beginner = more explanation, explain every technical term in brackets, extra safety notes). Short sentences, numbered actionable steps (3-10). Mark tools/materials the user already owns (from their inventory) as inInventory=true. Material "spec" must contain concrete requirements (dimensions, material, function) or "measure first: ..." if unknown. Prefer repair and reuse over replacement; "reuseTip" explains a reuse or second-hand option without claiming CO2 numbers. Warnings: concrete, at least one.
Set unused fields to null / empty arrays.`;

const AI_NOTICES: Record<AiErrorCode, string> = {
  config: "The AI service is not configured correctly.",
  quota: "The AI quota is used up. Please try again later.",
  "rate-limit": "Too many requests right now. Please wait a moment and try again.",
  refused: "The AI service declined this request.",
  "invalid-output": "The AI answer was incomplete.",
  timeout: "The AI took too long to answer. Please try again.",
  unavailable: "The AI could not answer right now. Please try again.",
};

function buildContent(input: z.infer<typeof caseInputSchema>): AiContent[] {
  const skillLabel = {
    beginner: "beginner",
    some_experience: "some experience",
    experienced: "experienced",
  }[input.skill];
  const qa = input.answers.length
    ? `\n\nFollow-up answers so far (${input.answers.length}):\n` +
      input.answers.map((x, i) => `${i + 1}. Q: ${x.q}\n   A: ${x.a || "(no answer)"}`).join("\n")
    : "";
  const text = `Problem: ${input.problem}\nSkill level: ${skillLabel}\nTools & materials I already have: ${input.inventory || "not specified"}${qa}`;
  const content: AiContent[] = [{ type: "text", text }];
  const photo = input.photo?.match(/^data:image\/jpeg;base64,(.+)$/);
  if (photo?.[1]) content.push({ type: "image", mediaType: "image/jpeg", dataBase64: photo[1] });
  return content;
}

export type AssessResponse =
  { ok: true; result: RepairResult; source: "ai" | "safety_rule" } | { ok: false; error: string };

export const assessCase = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => caseInputSchema.parse(d))
  .handler(async ({ data }): Promise<AssessResponse> => {
    const escalation = hazardEscalation(
      `${data.problem} ${data.answers.map((a) => a.a).join(" ")}`,
    );
    if (escalation) return { ok: true, source: "safety_rule", result: escalation };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = repairResultSchema.parse(
          await generateJson({
            system: INSTRUCTIONS,
            content: buildContent(data),
            schema: repairResultSchema,
          }),
        );
        return { ok: true, source: "ai", result: enforceSafety(raw) };
      } catch (e) {
        const retryable = !(e instanceof AiError) || e.code === "invalid-output";
        if (attempt === 1 || !retryable) {
          return {
            ok: false,
            error:
              e instanceof AiError && e.code !== "invalid-output"
                ? AI_NOTICES[e.code]
                : "We couldn't produce a reliable answer for this case. Please add a few more details and try again.",
          };
        }
      }
    }
    return { ok: false, error: "Something went wrong." };
  });

const explainInput = z.object({
  problem: z.string().max(2000),
  skill: z.string().max(40),
  stepTitle: z.string().max(300),
  stepDetail: z.string().max(2000),
  question: z.string().max(1000).nullable(),
});

export const explainStep = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => explainInput.parse(d))
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; text: string; escalate: boolean } | { ok: false; error: string }> => {
      if (data.question && detectHazards(data.question).length) {
        return {
          ok: true,
          escalate: true,
          text: "That sounds dangerous. Stop now, make the area safe and contact a professional.",
        };
      }
      const answerSchema = z.object({ text: z.string(), escalate: z.boolean() });
      try {
        const r = answerSchema.parse(
          await generateJson({
            system:
              "You help someone during a home repair. Answer in short, simple sentences (max 6), explain any technical term. If the situation sounds unsafe, set escalate=true and tell them to stop. If you don't know, say so honestly.",
            content: [
              {
                type: "text",
                text: `Repair: ${data.problem}\nSkill: ${data.skill}\nStep: ${data.stepTitle} — ${data.stepDetail}\n${data.question ? `My problem/question: ${data.question}` : "Please explain this step again more simply."}`,
              },
            ],
            schema: answerSchema,
          }),
        );
        return { ok: true, ...r };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof AiError ? AI_NOTICES[e.code] : "Couldn't get an explanation.",
        };
      }
    },
  );
