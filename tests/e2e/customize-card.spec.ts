import { expect, test } from "@playwright/test";

/**
 * User Story 2 (P2): customize theme/font/pattern/template/description, with
 * the preview updating live and a shareable URL reflecting every change
 * (FR-005, FR-007, FR-008, SC-005).
 */
test.describe("customization flow", () => {
  test("changing theme/template updates the preview src and shareable URL", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toBeVisible();

    await page.getByLabel("Theme").selectOption("dark");
    await page.getByLabel("Template").selectOption("minimal");

    await expect(preview).toHaveAttribute("src", /theme=dark/);
    await expect(preview).toHaveAttribute("src", /template=minimal/);

    const shareableInput = page.locator('input[readonly]');
    await expect(shareableInput).toHaveValue(/theme=dark/);
    await expect(shareableInput).toHaveValue(/template=minimal/);
  });

  test("a description override replaces the description in the shareable URL", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    await page.getByLabel("Description override").fill("Pin up your repo.");

    const shareableInput = page.locator('input[readonly]');
    await expect(shareableInput).toHaveValue(/description=Pin/);
  });
});
