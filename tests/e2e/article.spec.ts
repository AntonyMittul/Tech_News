import { expect, test } from "@playwright/test";

test("opens an article detail page from the feed", async ({ page }) => {
  await page.goto("/");
  const articleLink = page.locator("article h2 a").first();
  await expect(articleLink).toBeVisible();
  await articleLink.click();
  await expect(page.getByRole("link", { name: /Read original article/ })).toBeVisible();
  await expect(page.getByText("Summary", { exact: true })).toBeVisible();
});
