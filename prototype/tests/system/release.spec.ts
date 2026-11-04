import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

// Release checks: the production build as it is handed over, against the AI stub. They look at the whole
// product (every page, the first visit, what the build ships), not at one use case.

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
const textFiles = (dir: string) => files(dir).filter((f) => /\.(js|mjs|css|html|json)$/.test(f));
const holding = (dir: string, needle: string) =>
  textFiles(dir).filter((f) => readFileSync(f, "utf8").includes(needle));

// TST-090 · level: release · module: system
// guards: UC-017; USE-WITHOUT-ACCOUNT
// given: the production build with the AI stub, a person with no account and no stored data
// input: each page of the menu is opened: the start page, the inventory, the history and the profile
// expect: each page answers with status 200 and shows a heading, and none shows the page that says it did not load
test("every page of the menu opens without an error and without an account", async ({ page }) => {
  for (const path of ["/", "/inventory", "/history", "/profile"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading").first(), path).toBeVisible();
    await expect(page.getByText("This page didn't load"), path).toHaveCount(0);
  }
});

// TST-091 · level: release · module: system
// guards: AI-INTERACTION-DISCLOSED; PRIVATE-BY-DEFAULT
// given: the production build with the AI stub, a first visit
// input: the start page is opened and left alone
// expect: the notice that an AI system is used and the privacy notice are shown, and nothing was sent to the AI
test("the first visit tells about the AI and the privacy before anything is sent", async ({
  page,
}) => {
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_serverFn/")) sent.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByText(/AI system/i).first()).toBeVisible();
  await expect(page.getByText(/privacy/i).first()).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(sent).toEqual([]);
});

// TST-092 · level: release · module: system
// guards: DATA-MINIMISATION; PRIVATE-BY-DEFAULT
// given: the production build in .output, whose server files read the key of the AI provider
// input: the files handed to the browser are searched for the name of that key and for the address of the AI
// expect: the server files hold the name of the key (so the search can find it) and the files of the browser hold neither it nor the address
test("the files handed to the browser hold no key of the AI provider", () => {
  const out = join(process.cwd(), ".output");
  // The positive control: the same search finds the name in the server files.
  expect(holding(join(out, "server"), "AI_PROVIDER_API_KEY").length).toBeGreaterThan(0);
  expect(holding(join(out, "public"), "AI_PROVIDER_API_KEY")).toEqual([]);
  expect(holding(join(out, "public"), "AI_BASE_URL")).toEqual([]);
});
