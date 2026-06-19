import { expect, test } from "@playwright/test";

/**
 * User Story 2 (P2): customize theme/font/pattern/template/description, with
 * the preview updating live to reflect every change (FR-005, FR-007, FR-008).
 * The export panel (tested separately in export-card.spec.ts) carries the
 * same config forward into the shareable URL/snippets.
 */
test.describe("customization flow", () => {
  test("changing theme/template updates the preview src", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toBeVisible();

    await page.getByLabel("Theme").selectOption("dark");
    await page.getByLabel("Template").selectOption("minimal");

    await expect(preview).toHaveAttribute("src", /theme=dark/);
    await expect(preview).toHaveAttribute("src", /template=minimal/);
  });

  test("a description override is reflected in the preview src", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await page.getByLabel("Description override").fill("Pin up your repo.");

    await expect(preview).toHaveAttribute("src", /description=Pin/);
  });
});
