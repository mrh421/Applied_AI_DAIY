import { startAiStub } from "./server";
import { respond } from "./scenarios";

// The stub as a process of its own, for the system tests: `bun tests/system/ai-stub/serve.ts`.
const port = Number(process.env["AI_STUB_PORT"] ?? 4510);
const stub = await startAiStub({ port, respond });
console.log(`AI stub on ${stub.url}`);
