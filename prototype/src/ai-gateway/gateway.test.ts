// @vitest-environment node
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { AiError, generateJson } from "./index";

// `text` is what the model wrote. The SDK asks an unknown model for its JSON through a forced
// tool named "json"; the stub answers in the form the request asked for.
type Reply = { status: number; text?: string; error?: unknown; delayMs?: number };

let server: Server;
let reply: Reply = { status: 200 };
let lastRequest: { headers: IncomingMessage["headers"]; body: string } | undefined;

const schema = z.object({ answer: z.string() });

function anthropicOk(text: string, toolMode: boolean) {
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
    model: "test-model",
    content,
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  };
}

beforeAll(async () => {
  server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      lastRequest = { headers: req.headers, body: Buffer.concat(chunks).toString("utf8") };
      setTimeout(() => {
        res.writeHead(reply.status, { "content-type": "application/json" });
        const toolMode = lastRequest?.body.includes('"name":"json"') ?? false;
        const body =
          reply.status === 200 ? anthropicOk(reply.text ?? "", toolMode) : (reply.error ?? {});
        res.end(JSON.stringify(body));
      }, reply.delayMs ?? 0);
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  process.env["AI_BASE_URL"] = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
});

afterAll(() => {
  server.closeAllConnections();
  server.close();
});

beforeEach(() => {
  reply = { status: 200 };
  lastRequest = undefined;
  process.env["AI_PROVIDER_API_KEY"] = "test-key";
  process.env["AI_MODEL"] = "test-model";
  process.env["AI_TIMEOUT_MS"] = "5000";
});

function call(opts: { timeoutMs?: number } = {}) {
  return generateJson({
    system: "Be brief.",
    content: [{ type: "text", text: "hello" }],
    schema,
    ...opts,
  });
}

async function codeOf(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    expect(e).toBeInstanceOf(AiError);
    return (e as AiError).code;
  }
  throw new Error("expected AiError");
}

describe("generateJson", () => {
  it("returns the JSON the model wrote", async () => {
    reply = { status: 200, text: '{"answer":"ok"}' };

    expect(await call()).toEqual({ answer: "ok" });
  });

  it("sends the key, the model and the schema to the provider", async () => {
    reply = { status: 200, text: '{"answer":"ok"}' };

    await call();

    expect(lastRequest?.headers["x-api-key"]).toBe("test-key");
    expect(lastRequest?.body).toContain('"model":"test-model"');
    expect(lastRequest?.body).toContain("answer");
  });

  it.each([
    [401, "config"],
    [402, "quota"],
    [403, "refused"],
    [429, "rate-limit"],
    [500, "unavailable"],
    [503, "unavailable"],
  ] as const)("maps HTTP %i to %s", async (status, code) => {
    reply = { status, error: { type: "error", error: { type: "x", message: "no" } } };

    expect(await codeOf(call())).toBe(code);
  });

  it("maps output that is not JSON to invalid-output", async () => {
    reply = { status: 200, text: "not json" };

    expect(await codeOf(call())).toBe("invalid-output");
  });

  it("maps output that does not match the schema to invalid-output", async () => {
    reply = { status: 200, text: '{"wrong":1}' };

    expect(await codeOf(call())).toBe("invalid-output");
  });

  it("maps a slow call to timeout", async () => {
    reply = { status: 200, text: '{"answer":"ok"}', delayMs: 500 };

    expect(await codeOf(call({ timeoutMs: 50 }))).toBe("timeout");
  });

  it("maps a refused connection to unavailable", async () => {
    const saved = process.env["AI_BASE_URL"];
    process.env["AI_BASE_URL"] = "http://127.0.0.1:1/v1";
    try {
      expect(await codeOf(call())).toBe("unavailable");
    } finally {
      process.env["AI_BASE_URL"] = saved;
    }
  });

  it("maps a missing key or model to config without calling the provider", async () => {
    delete process.env["AI_PROVIDER_API_KEY"];
    expect(await codeOf(call())).toBe("config");
    process.env["AI_PROVIDER_API_KEY"] = "test-key";
    delete process.env["AI_MODEL"];
    expect(await codeOf(call())).toBe("config");
    expect(lastRequest).toBeUndefined();
  });
});
