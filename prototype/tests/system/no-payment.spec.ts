import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// NO-IN-APP-PURCHASE: the product has no purchase function. An offer leaves the app through a link to the seller.

const PAYMENT_NAME =
  /\b(pay|payment|checkout|check out|add to cart|add to basket|buy now|buy|purchase|order now)\b/i;
const PAYMENT_FIELDS =
  'input[autocomplete^="cc-"], input[name*="card" i], input[name*="cvc" i], input[name*="iban" i], iframe[src*="stripe" i], iframe[src*="paypal" i]';

/** The number of payment controls on the page: fields for a card, buttons and links named pay, checkout, add to cart. */
async function paymentControls(page: Page): Promise<number> {
  const named =
    (await page.getByRole("button", { name: PAYMENT_NAME }).count()) +
    (await page.getByRole("link", { name: PAYMENT_NAME }).count());
  return named + (await page.locator(PAYMENT_FIELDS).count());
}

async function expectNoPayment(page: Page, where: string): Promise<void> {
  expect(await paymentControls(page), `a payment control on ${where}`).toBe(0);
}

// TST-099 · level: system · module: system
// guards: NO-IN-APP-PURCHASE
// given: the production build with the AI stub, a project whose plan has packages and materials
// input: every page is opened: the start page, the plan, the materials, the offers, the work, the inventory, the history and the profile
// expect: on none of them is a card or payment field, a button or link named pay, checkout, buy or add to cart; the offers go to the seller by a link
test("no page of the app takes a payment", async ({ page }) => {
  await page.goto("/");
  await expectNoPayment(page, "the start page");

  await page
    .getByLabel(/What.s broken/)
    .fill("PROJECT The tap drips and the bathroom ceiling needs repainting.");
  await page.getByRole("button", { name: "Find my repair" }).click();
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await expectNoPayment(page, "the plan");

  await page.getByRole("link", { name: "Materials and tools" }).click();
  await expect(page.getByRole("heading", { name: "Materials and tools" })).toBeVisible();
  await expectNoPayment(page, "the materials");

  // The offers of a missing material: they leave the app through a link to the seller.
  const offers = page.getByRole("link", { name: /^See offers for / }).first();
  await expect(offers).toBeVisible();
  await offers.click();
  await expect(page.getByRole("link", { name: /^Go to seller: / }).first()).toBeVisible();
  await expectNoPayment(page, "the offers");

  await page.goBack();
  await page.goBack();
  await page
    .getByRole("link", { name: /^Start the work: / })
    .first()
    .click();
  await expect(page.getByLabel("Done: step 1")).toBeVisible();
  await expectNoPayment(page, "the work");

  for (const path of ["/inventory", "/history", "/profile"]) {
    await page.goto(path);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expectNoPayment(page, path);
  }
});

// TST-100 · level: system · module: system
// guards: NO-IN-APP-PURCHASE
// given: a page the test builds with a button named pay, a link named checkout and a card field
// input: the search for payment controls runs on it
// expect: it finds all three, so that the search of TST-099 is shown to work
test("the search for payment controls finds a payment control (positive control)", async ({
  page,
}) => {
  await page.setContent(
    '<main><button>Pay now</button><a href="#c">Checkout</a><input name="cardnumber" autocomplete="cc-number"></main>',
  );
  expect(await paymentControls(page)).toBeGreaterThanOrEqual(3);
});
