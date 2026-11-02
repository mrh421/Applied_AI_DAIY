import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// ITM-257, UC-025, UC-026: axe on every screen in the browser, at 320 CSS pixels, at 200 percent
// text, and a full case with the keyboard alone and a visible focus.

// Builds a case with a guide and returns the paths of every screen, a stored case behind each.
async function buildCase(page: Page): Promise<string[]> {
  await page.goto("/inventory");
  await page.getByLabel("Tool name").fill("Spanner");
  await page.getByRole("button", { name: "Add tool" }).click();
  await page.getByLabel("Material name").fill("Seal");
  await page.getByLabel("Amount").fill("1");
  await page.getByLabel("Unit").click();
  await page.getByRole("option", { name: "piece" }).click();
  await page.getByRole("button", { name: "Add material" }).click();

  await page.goto("/");
  await page.getByLabel(/What.s broken/).fill("TAP-REPAIR The kitchen tap drips.");
  await page.getByRole("button", { name: "Find my repair" }).click();
  await page.getByLabel("How old is the tap?", { exact: true }).fill("About five years");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  const id = /\/case\/([^/?]+)/.exec(page.url())?.[1] ?? "";

  const danger = await page.context().newPage();
  await danger.goto("/");
  await danger.getByLabel(/What.s broken/).fill("I smell gas in the kitchen.");
  await danger.getByRole("button", { name: "Find my repair" }).click();
  await expect(danger.getByRole("heading", { name: "Please get professional help" })).toBeVisible();
  const dangerId = /\/case\/([^/?]+)/.exec(danger.url())?.[1] ?? "";
  await danger.close();

  return [
    "/",
    `/?case=${id}`,
    `/case/${id}`,
    `/case/${dangerId}`,
    `/case/${id}/work/p1`,
    `/case/${id}/materials`,
    `/case/${id}/offers/m1`,
    "/profile",
    "/inventory",
    "/history",
    "/nothing-here",
  ];
}

async function axeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return result.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
  );
}

async function settle(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("h1, h2").first()).toBeVisible();
}

const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe("accessibility in the browser", () => {
  test("no axe violation on any screen", async ({ page }) => {
    const paths = await buildCase(page);
    for (const path of paths) {
      await settle(page, path);
      expect(await axeViolations(page), path).toEqual([]);
    }
  });

  test("no horizontal scrolling and no axe violation at 320 CSS pixels", async ({ page }) => {
    const paths = await buildCase(page);
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of paths) {
      await settle(page, path);
      expect(await hasHorizontalScroll(page), `scrolls sideways: ${path}`).toBe(false);
      expect(await axeViolations(page), path).toEqual([]);
    }
  });

  test("text at 200 percent stays readable: no sideways scrolling, no violation", async ({
    page,
  }) => {
    const paths = await buildCase(page);
    await page.setViewportSize({ width: 640, height: 800 });
    for (const path of paths) {
      await settle(page, path);
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      expect(await hasHorizontalScroll(page), `scrolls sideways: ${path}`).toBe(false);
      expect(await axeViolations(page), path).toEqual([]);
    }
  });
});

// The focus indicator the browser shows for the element that has the keyboard focus.
async function focusIsVisible(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const cs = getComputedStyle(el);
    const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
    return outline || cs.boxShadow !== "none";
  });
}

// Presses Tab until the element with this accessible name has the focus; every stop on the way
// must show its focus.
async function tabTo(page: Page, match: { role: string; name: string | RegExp }) {
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press("Tab");
    expect(await focusIsVisible(page), `focus not visible at stop ${i}`).toBe(true);
    const found = await page.evaluate(
      ({ role, name }) => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return false;
        const label =
          el.getAttribute("aria-label") ??
          (el as HTMLInputElement).labels?.[0]?.textContent ??
          el.textContent ??
          "";
        const roleOk =
          (el.getAttribute("role") ?? el.tagName.toLowerCase()) === role ||
          (role === "link" && el.tagName === "A") ||
          (role === "button" && el.tagName === "BUTTON") ||
          (role === "textbox" && (el.tagName === "TEXTAREA" || el.tagName === "INPUT"));
        return roleOk && new RegExp(name, "i").test(label);
      },
      { role: match.role, name: typeof match.name === "string" ? match.name : match.name.source },
    );
    if (found) return;
  }
  throw new Error(`no stop reaches ${match.role} ${match.name}`);
}

test("a full case by keyboard alone, with a visible focus", async ({ page }) => {
  await page.goto("/");
  // The pages are drawn in the browser: press Tab only once there is something to focus.
  await expect(page.getByRole("heading", { name: "Fix it yourself — safely." })).toBeVisible();
  await tabTo(page, { role: "textbox", name: /What.s broken/ });
  await page.keyboard.type("TAP-REPAIR The kitchen tap drips.");
  await tabTo(page, { role: "button", name: "^Find my repair" });
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: "A few quick questions" })).toBeVisible();
  await tabTo(page, { role: "textbox", name: "^How old is the tap\\?$" });
  await page.keyboard.type("About five years");
  await tabTo(page, { role: "button", name: "^Continue" });
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await tabTo(page, { role: "link", name: "Start the work" });
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: "Replace the seal" })).toBeVisible();
  await tabTo(page, { role: "checkbox", name: "Done: step 1" });
  await page.keyboard.press("Space");
  await expect(page.getByLabel("Done: step 1")).toBeChecked();
});

// ITM-267: several photos on the start page, each with its own text alternative and remove button.
test("several photos on the start page: named, removable by keyboard, no violation, no sideways scroll", async ({
  page,
}) => {
  const jpeg = (name: string) => ({
    name,
    mimeType: "image/jpeg",
    buffer: Buffer.from(
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
      "base64",
    ),
  });
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Fix it yourself — safely." })).toBeVisible();
    await page.getByLabel(/add a photo/i).setInputFiles([jpeg("a.jpg"), jpeg("b.jpg")]);
    await expect(page.getByRole("img", { name: "Your photo: a.jpg" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Your photo: b.jpg" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  }
  await page.getByRole("button", { name: "Remove the photo a.jpg" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("img", { name: "Your photo: a.jpg" })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Your photo: b.jpg" })).toBeVisible();
});
