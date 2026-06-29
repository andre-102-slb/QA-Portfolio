import { test, expect } from "@playwright/test";

test("login page loads", async ({ page }) => {
  await page.goto("");

  await expect(page.getByTestId("login-button")).toBeVisible();
});

test("login page loads 2", async ({ page }) => {
  await page.goto("");

  await expect(page.getByTestId("login-button")).toBeVisible();
});