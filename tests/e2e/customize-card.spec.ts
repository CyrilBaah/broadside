import { expect, test } from "@playwright/test";

/**
 * User Story 2 (P2): customize theme/font/pattern/template/description, with
 * the preview updating live to reflect every change (FR-005, FR-007, FR-008).
 * The export panel (tested separately in export-card.spec.ts) carries the
 * same config forward into the shareable URL/snippets.
 */
test.describe("customization flow", () => {
  test("the customization panel is hidden until a repo is submitted", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("group", { name: "Display fields" })).toBeHidden();
    await expect(page.getByText("Your card preview will appear here once you generate one.")).toBeVisible();
  });

  test("display field checkboxes default to Name/Owner/Language/Stars and toggle the preview src", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const fields = page.getByRole("group", { name: "Display fields" });
    await expect(fields.getByLabel("Name")).toBeChecked();
    await expect(fields.getByLabel("Owner")).toBeChecked();
    await expect(fields.getByLabel("Language")).toBeChecked();
    await expect(fields.getByLabel("Stars")).toBeChecked();
    await expect(fields.getByLabel("Forks")).not.toBeChecked();
    await expect(fields.getByLabel("Issues")).not.toBeChecked();
    await expect(fields.getByLabel("Pull Requests")).not.toBeChecked();
    await expect(fields.getByLabel("Description")).not.toBeChecked();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await fields.getByLabel("Forks").check();
    await expect(preview).toHaveAttribute("src", /fields=.*forks/);

    await fields.getByLabel("Stars").uncheck();
    await expect(preview).toHaveAttribute("src", /fields=(?!.*stars)/);
  });

  test("changing theme/template updates the preview src", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toBeVisible();

    await page.getByRole("radiogroup", { name: "Theme" }).getByRole("radio", { name: "Dark" }).click();
    await page
      .getByRole("radiogroup", { name: "Template" })
      .getByRole("radio", { name: "Minimal" })
      .click();

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

  // FR-016, US2 Acceptance Scenario 7.
  test("picking a language icon updates the preview src with languageIcon=", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toBeVisible();

    await page.getByRole("button", { name: "Auto-detect" }).click();
    await page.getByRole("listbox", { name: "Language icon" }).getByRole("option", { name: "Rust" }).click();

    await expect(preview).toHaveAttribute("src", /languageIcon=rust/);
  });

  // FR-015, US2 Acceptance Scenario 6.
  test("pasting a logo URL updates the preview; a malformed paste is rejected and the prior logo is kept", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toBeVisible();

    const urlInput = page.getByLabel("Or paste an image URL or data URI");
    await urlInput.fill("https://example.com/logo.png");
    await page.getByRole("button", { name: "Use" }).click();

    await expect(preview).toHaveAttribute("src", /logo=https%3A%2F%2Fexample\.com%2Flogo\.png/);

    await urlInput.fill("not a url at all");
    await page.getByRole("button", { name: "Use" }).click();

    await expect(page.locator('p[role="alert"]')).toBeVisible();
    await expect(preview).toHaveAttribute("src", /logo=https%3A%2F%2Fexample\.com%2Flogo\.png/);
  });
});
