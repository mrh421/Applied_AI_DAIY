import { defineConfig } from "vitest/config";
import path from "node:path";

// The evaluation run of prototype/eval/: real AI calls, so it is not part of `bun run test`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["eval/**/*.eval.ts"],
    testTimeout: 60 * 60 * 1000,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
