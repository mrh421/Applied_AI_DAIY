// Level: unit
// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { startAiStub, recorded, type AiStub } from "../../tests/system/ai-stub/server";
import { AiError, type AiErrorCode } from "../ai-gateway";
import { draftAssessment, draftExplanation, draftStepAnswer } from "../ai-tasks";
import { schemas } from "../case-model";
import { caseRequest, explainRequest, stepQuestionRequest } from "../case-pipeline/fixtures";

// ITM-250, ARC-003: the AI tasks and the gateway together, against a stub of the provider
// with recorded drafts. UC-001, UC-003, NO-ASSUMPTIONS-AS-FACTS.

let stub: AiStub;

beforeAll(async () => {
  stub = await startAiStub();
  process.env["AI_BASE_URL"] = stub.url;
});
afterAll(async () => {
  await stub.close();
});
beforeEach(() => {
  stub.reset();
  process.env["AI_PROVIDER_API_KEY"] = "test-key";
  process.env["AI_MODEL"] = "stub-model";
  process.env["AI_TIMEOUT_MS"] = "5000";
});

const tasks = [
  [
    "the assessment",
    () => draftAssessment(caseRequest),
    recorded.assessment,
    schemas.assessmentDraft,
  ],
  [
    "the questions of a first round",
    () => draftAssessment(caseRequest),
    recorded.questions,
    schemas.assessmentDraft,
  ],
  [
    "the explanation",
    () => draftExplanation(explainRequest),
    recorded.explanation,
    schemas.explanationDraft,
  ],
  [
    "the answer to a step question",
    () => draftStepAnswer(stepQuestionRequest),
    recorded.stepAnswer,
    schemas.stepAnswerDraft,
  ],
] as const;

async function codeOf(p: Promise<unknown>): Promise<AiErrorCode> {
  try {
    await p;
  } catch (e) {
    expect(e).toBeInstanceOf(AiError);
    return (e as AiError).code;
  }
  throw new Error("expected an AiError");
}

describe("AI access: the tasks round-trip through the structured output", () => {
  it.each(tasks)("%s returns a schema-valid draft", async (_name, run, draft, schema) => {
    stub.answerWith(draft);

    const result = await run();

    expect(schema.safeParse(result).success).toBe(true);
    expect(result).toEqual(draft);
    expect(stub.requests).toHaveLength(1);
  });

  it("sends the key and the model of the configuration, and the case text, to the provider", async () => {
    stub.answerWith(recorded.assessment);

    await draftAssessment(caseRequest);

    expect(stub.requests[0]?.headers["x-api-key"]).toBe("test-key");
    expect(stub.requests[0]?.body).toContain('"model":"stub-model"');
    expect(stub.requests[0]?.body).toContain(caseRequest.description);
  });
});

describe("AI access: each error code reaches the caller", () => {
  const failing = [
    ["the assessment", () => draftAssessment(caseRequest)],
    ["the explanation", () => draftExplanation(explainRequest)],
    ["the step answer", () => draftStepAnswer(stepQuestionRequest)],
  ] as const;

  const http = [
    [401, "config"],
    [402, "quota"],
    [403, "refused"],
    [429, "rate-limit"],
    [503, "unavailable"],
  ] as const;

  for (const [name, run] of failing) {
    it.each(http)(`${name}: HTTP %i reaches the caller as %s`, async (status, code) => {
      stub.reply({ status, error: { type: "error", error: { type: "x", message: "no" } } });
      expect(await codeOf(run())).toBe(code);
    });
  }

  it.each(failing)("%s: an answer that is not JSON is invalid-output", async (_n, run) => {
    stub.reply({ status: 200, text: "I would be happy to help with your tap." });
    expect(await codeOf(run())).toBe("invalid-output");
  });

  it.each(failing)(
    "%s: no key and model is the code config, without a request",
    async (_n, run) => {
      delete process.env["AI_PROVIDER_API_KEY"];
      expect(await codeOf(run())).toBe("config");
      expect(stub.requests).toHaveLength(0);
    },
  );

  it("a provider that does not answer in time is a timeout", async () => {
    process.env["AI_TIMEOUT_MS"] = "100";
    stub.reply({ status: 200, text: JSON.stringify(recorded.assessment), delayMs: 600 });
    expect(await codeOf(draftAssessment(caseRequest))).toBe("timeout");
  });
});

describe("AI access: no AI output reaches the caller without validation (UC-003)", () => {
  it("a draft that breaks the schema is invalid-output, not data", async () => {
    stub.answerWith({ ...recorded.assessment, risk: "catastrophic" });
    expect(await codeOf(draftAssessment(caseRequest))).toBe("invalid-output");
  });

  it("a draft with a missing field is invalid-output", async () => {
    stub.answerWith({ steps: [{ n: 1 }] });
    expect(await codeOf(draftExplanation(explainRequest))).toBe("invalid-output");
  });

  it("a step answer without its hazards list is invalid-output", async () => {
    stub.answerWith({ answer: "Just do it.", risk: "low" });
    expect(await codeOf(draftStepAnswer(stepQuestionRequest))).toBe("invalid-output");
  });
});
