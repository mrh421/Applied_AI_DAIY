import { expect, test } from "@playwright/test";

// UC-001, UC-002, UC-004: a repair with questions, a guide and the check-off of its steps,
// without an account (UC-017).

test("a repair: question, guide, check-off that survives a reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Fix it yourself — safely." })).toBeVisible();
  await page.getByLabel(/What.s broken/).fill("TAP-REPAIR The kitchen tap drips.");
  await page.getByRole("button", { name: "Find my repair" }).click();

  // The assessment asks one question first.
  await expect(page.getByRole("heading", { name: "A few quick questions" })).toBeVisible();
  await page.getByLabel("How old is the tap?", { exact: true }).fill("About five years");
  await page.getByRole("button", { name: "Continue" }).click();

  // Then the plan with its steps.
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await expect(page.getByText("A tap drips.")).toBeVisible();
  await expect(page.getByText("Replace the seal").first()).toBeVisible();

  await page.getByRole("link", { name: "Start the work: Replace the seal" }).click();
  await expect(page.getByRole("heading", { name: "Replace the seal" })).toBeVisible();
  await page.getByLabel("Done: step 1").check();
  await page.getByLabel("Done: step 2").check();
  await expect(page.getByLabel("Done: step 2")).toBeChecked();

  // A question about a step is answered in its context.
  await page.getByLabel("Question about step 2").fill("The cap is stuck.");
  await page.getByRole("button", { name: "Ask about step 2" }).click();
  await expect(page.getByText("Turn the cap slowly with a cloth around it.")).toBeVisible();

  // The check-off is stored on the device.
  await page.reload();
  await expect(page.getByLabel("Done: step 1")).toBeChecked();
  await expect(page.getByLabel("Done: step 2")).toBeChecked();
  await expect(page.getByLabel("Done: step 3")).not.toBeChecked();

  // The case is in the history.
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByText("TAP-REPAIR The kitchen tap drips.")).toBeVisible();
});

test("the whole flow needs no account", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  await page.goto("/");
  await expect(page.getByText(/sign in|log in|create an account|password/i)).toHaveCount(0);
  expect(requests.some((p) => /account|login|signin|sign-in/i.test(p))).toBe(false);
});
