import { expect, test } from "@playwright/test";

test.describe("feed experience", () => {
  test("shows live feed controls and all channels", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("textbox", { name: "Search technology news" })).toBeVisible();
    await expect(page.getByRole("button", { name: "All live signals" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hiring & Layoffs/ })).toBeVisible();
  });

  test("remains usable on a narrow mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
});
