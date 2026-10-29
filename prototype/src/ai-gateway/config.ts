export type AiConfig = {
  apiKey: string | undefined;
  model: string | undefined;
  timeoutMs: number;
  baseUrl: string | undefined;
};

const DEFAULT_TIMEOUT_MS = 30_000;

export function readConfig(): AiConfig {
  const timeout = Number(process.env["AI_TIMEOUT_MS"]);
  return {
    apiKey: process.env["AI_PROVIDER_API_KEY"] || undefined,
    model: process.env["AI_MODEL"] || undefined,
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS,
    baseUrl: process.env["AI_BASE_URL"] || undefined,
  };
}
