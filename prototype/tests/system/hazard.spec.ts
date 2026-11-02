import { expect, test } from "@playwright/test";

// UC-011, SAF: a gas smell escalates, with the reason and the contacts, and the case holds no guide.

// TST-019 · level: system · module: system
// guards: UC-011; NO-GUIDE-FOR-HAZARDS; ESCALATION-REASON
// given: the production build with the AI stub, a person without an account
// input: the description 'I smell gas in the kitchen.'
// expect: the page asks for professional help with the contacts, offers no step and no link to start the work, and the case is in the history
test("a gas smell escalates and no instructions are given", async ({ page }) => {
  const aiCalls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_serverFn/")) aiCalls.push(r.url());
  });
  await page.goto("/");
  await page.getByLabel(/What.s broken/).fill("I smell gas in the kitchen.");
  await page.getByRole("button", { name: "Find my repair" }).click();

  await expect(page.getByRole("heading", { name: "Please get professional help" })).toBeVisible();
  await expect(page.getByText("Who to contact")).toBeVisible();
  await expect(page.getByRole("link", { name: /Start the work/ })).toHaveCount(0);
  await expect(page.getByLabel(/Done: step/)).toHaveCount(0);

  // The stored case holds an escalation and no guide.
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByText("I smell gas in the kitchen.")).toBeVisible();
});
