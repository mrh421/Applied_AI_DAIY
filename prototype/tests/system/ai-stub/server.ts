import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import type { AssessmentDraft, ExplanationDraft, StepAnswerDraft } from "../../../src/case-model";
import { answerDraft, questionsDraft } from "../../../src/case-pipeline/fixtures";

// A stand-in for the AI provider: it speaks the Anthropic messages protocol and answers with
// recorded drafts or with a chosen error, so the AI tasks and the gateway run for real
// (ARC-003) without a key and without a network.

export const recorded: {
  assessment: AssessmentDraft;
  questions: AssessmentDraft;
  explanation: ExplanationDraft;
  stepAnswer: StepAnswerDraft;
} = {
  assessment: answerDraft,
  questions: questionsDraft,
  explanation: {
    steps: [
      { n: 1, basics: "A stop valve is the small tap under the sink that cuts the water." },
      { n: 2, basics: "The cartridge is the part inside the handle that seals the water." },
    ],
  },
  stepAnswer: { answer: "Hold the tap body and turn the cap slowly.", risk: "low", hazards: [] },
};

export type Reply =
  | { status: 200; text: string; delayMs?: number }
  | { status: number; error?: unknown; delayMs?: number };

export type AiStub = {
  url: string;
  requests: { headers: IncomingMessage["headers"]; body: string }[];
  /** Answers every request with this JSON object, as the model would write it. */
  answerWith: (draft: unknown) => void;
  /** Answers every request with this reply. */
  reply: (reply: Reply) => void;
  reset: () => void;
  close: () => Promise<void>;
};

// The SDK asks for JSON through a forced tool named "json" when the model is unknown to it;
// the stub answers in the form the request asked for.
function messageBody(text: string, toolMode: boolean) {
  let content: unknown[] = [{ type: "text", text }];
  if (toolMode) {
    try {
      content = [{ type: "tool_use", id: "tu_1", name: "json", input: JSON.parse(text) }];
    } catch {
      // not JSON: leave it as text
    }
  }
  return {
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "stub-model",
    content,
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  };
}

export async function startAiStub(
  options: { port?: number; respond?: (body: string) => Reply } = {},
): Promise<AiStub> {
  let current: Reply = { status: 200, text: "{}" };
  const requests: AiStub["requests"] = [];
  const server: Server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      requests.push({ headers: req.headers, body });
      const reply = options.respond ? options.respond(body) : current;
      setTimeout(() => {
        res.writeHead(reply.status, { "content-type": "application/json" });
        const toolMode = body.includes('"name":"json"');
        res.end(
          JSON.stringify("text" in reply ? messageBody(reply.text, toolMode) : (reply.error ?? {})),
        );
      }, reply.delayMs ?? 0);
    });
  });
  await new Promise<void>((resolve) => server.listen(options.port ?? 0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    url: `http://127.0.0.1:${port}/v1`,
    requests,
    answerWith: (draft) => {
      current = { status: 200, text: JSON.stringify(draft) };
    },
    reply: (reply) => {
      current = reply;
    },
    reset: () => {
      current = { status: 200, text: "{}" };
      requests.length = 0;
    },
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
