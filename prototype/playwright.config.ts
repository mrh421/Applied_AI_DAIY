import { defineConfig } from "@playwright/test";

// System tests (ITM-256, ITM-257): the production build, served by its own server, against the
// AI stub with recorded drafts. Build first: `bun run build`; then `bun run test:system`.
const APP_PORT = 4511;
const STUB_PORT = 4510;

export default defineConfig({
  testDir: "tests/system",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${APP_PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: [
    {
      command: "bun tests/system/ai-stub/serve.ts",
      port: STUB_PORT,
      env: { AI_STUB_PORT: String(STUB_PORT) },
      reuseExistingServer: !process.env["CI"],
    },
    {
      command: "node .output/server/index.mjs",
      port: APP_PORT,
      env: {
        PORT: String(APP_PORT),
        AI_PROVIDER_API_KEY: "stub-key",
        AI_MODEL: "stub-model",
        AI_BASE_URL: `http://127.0.0.1:${STUB_PORT}/v1`,
      },
      reuseExistingServer: !process.env["CI"],
    },
  ],
});
