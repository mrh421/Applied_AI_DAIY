import { AiError } from "../ai-gateway";
import type { AiErrorCode } from "../ai-gateway";
import type { UserNotice } from "../case-model";

// The plain-language texts of the notices (UNDERSTANDABLE-ERROR-NOTICE). Nothing is invented.

const AI_ERROR_TEXTS: Record<AiErrorCode, string> = {
  config: "The AI service is not set up correctly. Please try again later.",
  quota: "The AI service has reached its limit for now. Please try again later.",
  "rate-limit": "Too many requests right now. Please wait a moment and try again.",
  refused: "The AI service declined this request. Please describe the case in other words.",
  "invalid-output": "The AI answer could not be read. Please try again.",
  timeout: "The AI took too long to answer. Please try again.",
  unavailable: "The AI could not answer right now. Please try again.",
};

export const INVALID_REQUEST_NOTICE: UserNotice = {
  reason: "technical-error",
  text: "Your request could not be read. Please go back and try again.",
  missing: [],
};

export const OUTPUT_REJECTED_NOTICE: UserNotice = {
  reason: "output-rejected",
  text: "We could not produce a reliable answer for this. Please add a few more details and try again.",
  missing: [],
};

export function technicalErrorNotice(error: unknown): UserNotice {
  const text =
    error instanceof AiError
      ? AI_ERROR_TEXTS[error.code]
      : "Something went wrong on our side. Please try again.";
  return { reason: "technical-error", text, missing: [] };
}
