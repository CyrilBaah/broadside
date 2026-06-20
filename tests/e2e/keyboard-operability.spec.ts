import { expect, test } from "@playwright/test";

/**
 * SC-006: every customization control must be operable by keyboard alone,
 * with a visible focus state. Covers the controls with the most custom
 * interaction logic (roving-tabindex segmented controls, the popover-based
 * language icon picker), where a mouse-only escape hatch is most likely to
 * sneak in. Plain native controls (checkboxes, text inputs, anchors) are
 * keyboard-operable by construction and aren't re-verified here.
 */
test.describe("keyboard operability (SC-006)", () => {
  test("the landing repo input can be submitted with the keyboard alone", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("github.com/owner/repo").focus();
    await page.keyboard.type("github.com/vercel/next.js");
    await page.keyboard.press("Enter");

    await expect(page.getByAltText("vercel/next.js announcement card")).toBeVisible();
  });

  test("a segmented control (Theme) can be changed with arrow keys", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const themeGroup = page.getByRole("radiogroup", { name: "Theme" });
    await themeGroup.getByRole("radio", { name: "Light" }).focus();
    await page.keyboard.press("ArrowRight");

    await expect(themeGroup.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toHaveAttribute("src", /theme=dark/);
  });

  test("a field-visibility checkbox can be toggled with the keyboard", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const fields = page.getByRole("group", { name: "Display fields" });
    const forks = fields.getByLabel("Forks");
    await forks.focus();
    await page.keyboard.press("Space");

    await expect(forks).toBeChecked();
  });

  test("the language icon picker can be opened and an option chosen with the keyboard", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const trigger = page.getByRole("button", { name: "Auto-detect" });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const option = page.getByRole("listbox", { name: "Language icon" }).getByRole("option", { name: "Rust" });
    await option.focus();
    await page.keyboard.press("Enter");

    const preview = page.getByAltText("vercel/next.js announcement card");
    await expect(preview).toHaveAttribute("src", /languageIcon=rust/);
  });

  test("an export copy button can be activated with the keyboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-write"]);
    await page.goto("/");
    await page.getByPlaceholder("github.com/owner/repo").fill("github.com/vercel/next.js");
    await page.getByRole("button", { name: "Generate" }).click();

    const copyButton = page.getByRole("button", { name: "Copy" }).first();
    await copyButton.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("button", { name: "Copied" }).first()).toBeVisible();
  });
});
