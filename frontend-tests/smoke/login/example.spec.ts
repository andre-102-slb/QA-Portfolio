import { test, expect } from "@playwright/test";

test("Verify if the username and password fields are visible and clickable", async ({ page }) => {
  await page.goto("");

  await expect(page.getByTestId("username")).toBeEditable();
  await expect(page.getByTestId("password")).toBeEditable();
});

test("has title 2", async ({ page }) => {
  await page.goto("");

  // Expect a title "to contain" a substring.
  await expect(page.getByTestId("username")).toBeEditable();
  await expect(page.getByTestId("password")).toBeEditable();
});