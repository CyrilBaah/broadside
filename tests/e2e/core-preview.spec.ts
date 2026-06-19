import { expect, test } from "@playwright/test";

/**
 * User Story 1 (P1, MVP): paste a public GitHub repo URL and see an immediate
 * live preview, with a clear friendly error for malformed input (FR-001, FR-002,
 * FR-014, SC-001).
 */
test.describe("core preview flow", () => {
  test("renders a preview after submitting a valid repo URL", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("src", /\/vercel\/next\.js\.png/);
  });

  test("shows a friendly inline error for a malformed URL, never a crash", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("github.com/owner/repo").fill("not a url at all");
    await page.getByRole("button", { name: "Generate" }).click();

    // Next.js's own route announcer also has role="alert", so scope to the <p>.
    await expect(page.locator("p[role='alert']")).toContainText(
      "doesn't look like a GitHub repo URL",
    );
  });
});
