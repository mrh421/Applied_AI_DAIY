import { expect, test } from "@playwright/test";

// UC-005, UC-007, UC-008: a project with work packages: one to do yourself, one for a professional,
// with the materials of the guide against the inventory.

test("a project with a DIY package, a professional package and its materials", async ({ page }) => {
  await page.goto("/inventory");
  await page.getByLabel("Tool name").fill("Spanner");
  await page.getByRole("button", { name: "Add tool" }).click();
  await expect(page.getByText("Spanner", { exact: true })).toBeVisible();
  // The status message is announced in the live region while the focus stays where it was.
  await expect(page.getByRole("status")).toHaveText("Spanner saved.");

  await page.getByRole("link", { name: "New case" }).click();
  await page
    .getByLabel(/What.s broken/)
    .fill("PROJECT The tap drips and the bathroom ceiling needs repainting.");
  await page.getByRole("button", { name: "Find my repair" }).click();

  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await expect(page.getByText("DIY", { exact: true })).toBeVisible();
  await expect(page.getByText("Professional only")).toBeVisible();
  await expect(page.getByText("Brief for the professional")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy brief" })).toBeVisible();

  // The materials of the guide and the tools, against the inventory.
  await page.getByRole("link", { name: "Materials and tools" }).click();
  await expect(page.getByRole("heading", { name: "Materials and tools" })).toBeVisible();
  await expect(page.getByText("Seal").first()).toBeVisible();
  await expect(page.getByText(/Missing|Partly available|Available/).first()).toBeVisible();
});
