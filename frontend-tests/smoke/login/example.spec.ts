import { test, expect } from "@playwright/test";

test("Verify if the username and password fields are visible and clickable", async ({ page }) => {
  await page.goto("");

  await expect(page.getByTestId("username")).toBeEditable();
  await expect(page.getByTestId("password")).toBeEditable();
});
