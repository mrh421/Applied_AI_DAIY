// Level: unit
// Module: MOD-app-shell
// @vitest-environment node
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

// MOD-app-shell: lint fails on an import into another module's folder other than its index.ts.
async function messages(code: string) {
  const eslint = new ESLint({ cwd: process.cwd() });
  const [result] = await eslint.lintText(code, { filePath: "src/profile/example.ts" });
  return (result?.messages ?? []).filter((m) => m.ruleId === "no-restricted-imports");
}

describe("import rule", () => {
  it("fails on an import of a file inside another module's folder", async () => {
    expect(await messages('import { x } from "../history/history";\nexport { x };\n')).toHaveLength(
      1,
    );
  });

  it("allows the index of another module and the files of its own folder", async () => {
    const code =
      'import { x } from "../history";\nimport { y } from "./other";\nexport { x, y };\n';
    expect(await messages(code)).toHaveLength(0);
  });

  it("allows the shared data folder", async () => {
    expect(
      await messages('import d from "../../data/catalogue/models.json";\nexport { d };\n'),
    ).toHaveLength(0);
  });
});
