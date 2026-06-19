import { expect, test } from "@playwright/test";

/**
 * User Story 3 (P1): export a live link with copy-paste embed snippets, or a
 * static download (FR-009, FR-009a, FR-010, US3 acceptance scenarios).
 */
test.describe("export flow", () => {
  test("offers copy actions for the raw URL, Markdown, and HTML snippets", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    await expect(page.getByText("Raw URL")).toBeVisible();
    await expect(page.getByText("Markdown")).toBeVisible();
    await expect(page.getByText("HTML")).toBeVisible();

    const copyButtons = page.getByRole("button", { name: "Copy" });
    await expect(copyButtons).toHaveCount(3);
  });

  test("offers a format selector and a download link", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const downloadLink = page.getByRole("link").filter({ hasText: "Download" });
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute("href", /\/vercel\/next\.js\.png/);

    await page.getByRole("combobox").last().selectOption("webp");
    await expect(downloadLink).toHaveAttribute("href", /\/vercel\/next\.js\.webp/);
  });
});
