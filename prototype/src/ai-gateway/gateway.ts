import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, Output, type ModelMessage } from "ai";
import type { ZodTypeAny } from "zod";

import { readConfig } from "./config";

const MAX_OUTPUT_TOKENS = 4096;

export type AiErrorCode =
  "config" | "quota" | "rate-limit" | "refused" | "invalid-output" | "timeout" | "unavailable";

export class AiError extends Error {
  readonly code: AiErrorCode;

  constructor(code: AiErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiError";
    this.code = code;
  }
}

export type AiContent =
  { type: "text"; text: string } | { type: "image"; mediaType: "image/jpeg"; dataBase64: string };

function statusOf(e: unknown): number | undefined {
  const err = e as { statusCode?: number; cause?: { statusCode?: number } } | null;
  return err?.statusCode ?? err?.cause?.statusCode;
}

function isTimeout(e: unknown): boolean {
  const name = (e as { name?: string } | null)?.name;
  return name === "TimeoutError" || name === "AbortError";
}

function isInvalidOutput(e: unknown): boolean {
  const name = (e as { name?: string } | null)?.name ?? "";
  return /NoObjectGenerated|NoOutputGenerated|JSONParse|TypeValidation|InvalidResponseData/.test(
    name,
  );
}

function mapError(e: unknown): AiError {
  if (e instanceof AiError) return e;
  if (isTimeout(e)) return new AiError("timeout", "The AI did not answer in time.", { cause: e });
  const status = statusOf(e);
  if (status === 401)
    return new AiError("config", "The AI service is not configured correctly.", { cause: e });
  if (status === 402) return new AiError("quota", "The AI quota is used up.", { cause: e });
  if (status === 403)
    return new AiError("refused", "The AI service declined this request.", { cause: e });
  if (status === 429)
    return new AiError("rate-limit", "Too many requests to the AI.", { cause: e });
  if (isInvalidOutput(e))
    return new AiError("invalid-output", "The AI answer was not usable.", { cause: e });
  return new AiError("unavailable", "The AI could not be reached.", { cause: e });
}

export async function generateJson(opts: {
  system: string;
  content: AiContent[];
  schema: ZodTypeAny;
  timeoutMs?: number;
}): Promise<unknown> {
  const config = readConfig();
  if (!config.apiKey || !config.model) {
    throw new AiError("config", "The AI service is not configured.");
  }
  const provider = createAnthropic({
    apiKey: config.apiKey,
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });
  const messages: ModelMessage[] = [
    {
      role: "user",
      content: opts.content.map((c) =>
        c.type === "text"
          ? { type: "text" as const, text: c.text }
          : { type: "image" as const, image: c.dataBase64, mediaType: c.mediaType },
      ),
    },
  ];
  try {
    const result = await generateText({
      model: provider(config.model),
      system: opts.system,
      messages,
      temperature: 0,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      output: Output.object({ schema: opts.schema }),
      abortSignal: AbortSignal.timeout(opts.timeoutMs ?? config.timeoutMs),
      maxRetries: 0,
    });
    return result.output;
  } catch (e) {
    throw mapError(e);
  }
}
