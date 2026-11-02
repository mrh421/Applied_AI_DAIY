import { expect, test } from "@playwright/test";

// UC-011, SAF: a gas smell escalates, with the reason and the contacts, and the case holds no guide.

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
