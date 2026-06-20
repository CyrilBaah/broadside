import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * SC-006: the repo-input form, customization panel, and export panel must
 * meet WCAG AA. Uses axe-core's WCAG 2.1 A/AA ruleset, which covers contrast,
 * labeling, and a number of keyboard/focus issues automated tooling can catch
 * (the rest — full keyboard traversal — is audited manually, see tasks.md T069).
 */
test.describe("accessibility (SC-006)", () => {
  test("the landing repo-input form has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(results.violations).toEqual([]);
  });

  test("the customization panel and export panel have no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();
    await expect(page.getByAltText("vercel/next.js announcement card")).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(results.violations).toEqual([]);
  });

  test("the dark theme has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();
    await expect(page.getByAltText("vercel/next.js announcement card")).toBeVisible();

    await page.getByRole("button", { name: "Toggle color theme" }).click();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(results.violations).toEqual([]);
  });
});
