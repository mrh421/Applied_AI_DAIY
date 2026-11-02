import { expect, test } from "@playwright/test";

// UC-001, UC-002, UC-004: a repair with questions, a guide and the check-off of its steps,
// without an account (UC-017).

// TST-021 · level: system · module: system
// guards: UC-001; UC-004; THREE-STEP-START; STEP-CHECK-OFF; FOLLOW-UP-DURING-EXECUTION
// given: the production build with the AI stub, no account
// input: a description, the answer to one question, the check-off of two steps and a question about a step
// expect: the plan appears, the checked steps are still checked after a reload, the question gets its answer and the case is in the history
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

  // The case can be picked up again and read again from the history (UC-016).
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page.getByText(/Replace the seal: 2 of 3 steps done/)).toBeVisible();
  await page.getByRole("link", { name: "Continue the work: Replace the seal" }).click();
  await expect(page.getByLabel("Done: step 2")).toBeChecked();
  await page.goto("/history");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("link", { name: "Read the plan again" }).click();
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await expect(page.getByText("A tap drips.")).toBeVisible();
});

// TST-022 · level: system · module: system
// guards: UC-017; USE-WITHOUT-ACCOUNT
// given: a person opening the start page
// input: the page and every request it makes
// expect: no sign-in, account or password text is shown and no request goes to an account address
test("the whole flow needs no account", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  await page.goto("/");
  await expect(page.getByText(/sign in|log in|create an account|password/i)).toHaveCount(0);
  expect(requests.some((p) => /account|login|signin|sign-in/i.test(p))).toBe(false);
});
