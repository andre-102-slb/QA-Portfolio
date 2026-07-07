import { test, expect } from "@playwright/test";
import { loginLocators } from "../../../locators";
import { Helper } from "../../../utils/helper";

test.describe("Login Tests Suite", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    
    helper = new Helper(page);
    await page.goto("/");
  });

  test("TC - Verify if the block user message appears", async ({ page }) => {
    // Fill the username password fields and click the login button
    await page
      .getByTestId(loginLocators.testId.usernameId)
      .fill(process.env.BLOCKED_USERNAME || "");
    await page
      .getByTestId(loginLocators.testId.passwordId)
      .fill(process.env.VALID_PASSWORD || "");
    await page.getByTestId(loginLocators.testId.loginButtonId).click();

    // Verify if the error message and error button are visible
    await helper.verifyInputIsVisibleAndEditable(
      loginLocators.testId.errorMessageId,
    );

    await expect(
      page.getByTestId(loginLocators.testId.errorMessageId),
    ).toHaveText("Epic sadface: Sorry, this user has been locked out.");

    // Verify if the error icon is visible
    const errorIconCount = await page
      .locator(loginLocators.class.errorIcon)
      .count();
    for (let i = 0; i < errorIconCount; i++) {
      await expect(
        page.locator(loginLocators.class.errorIcon).nth(i),
      ).toBeVisible();
    }
  });

  test("TC - Verify if the error button cleans the error message and the icons", async ({
    page,
  }) => {
    // Fill the username password fields and click the login button
    await page
      .getByTestId(loginLocators.testId.usernameId)
      .fill(process.env.BLOCKED_USERNAME || "");
    await page
      .getByTestId(loginLocators.testId.passwordId)
      .fill(process.env.VALID_PASSWORD || "");
    await page.getByTestId(loginLocators.testId.loginButtonId).click();

    // Verify if the error message and error button are visible
    await page.getByTestId(loginLocators.testId.errorButtonId).click();

    // Verify if the error icon is not visible
    await expect(page.locator(loginLocators.class.errorIcon)).not.toBeVisible();
  });
});
