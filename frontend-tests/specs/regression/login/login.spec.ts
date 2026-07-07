import { test, expect } from "@playwright/test";
import { loginLocators } from "../../../locators";
import { Helper } from "../../../utils/helper";
import { LoginComponent } from "../../../components";

test.describe("Login Tests Suite", () => {
  let helper: Helper;
  let loginComponent: LoginComponent;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    loginComponent = new LoginComponent(page);

    await page.goto("/");
  });

  test("LOGIN-02 - Verify if the block user message appears", async ({
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
    await helper.verifyInputIsVisibleAndEditable(
      loginLocators.testId.errorMessageId,
    );

    await loginComponent.verifyErrorStateIcons(
      loginLocators.testId.errorMessageId,
      "Epic sadface: Sorry, this user has been locked out.",
    );
  });

  test("LOGIN-03 - Verify if the error button cleans the error message and the icons", async ({
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

  test("LOGIN-06 - Verify if a error message appears after trying to login without username", async ({
    page,
  }) => {
    // Click the login button
    await page.getByTestId(loginLocators.testId.loginButtonId).click();

    // Verify if the error message appears

    await loginComponent.verifyErrorStateIcons(
      loginLocators.testId.errorMessageId,
      "Epic sadface: Username is required",
    );
  });

  test("LOGIN-07 - Verify if a error message appears after trying to login without password", async ({
    page,
  }) => {
    // Fill the username field with a valid username
    await page
      .getByTestId(loginLocators.testId.usernameId)
      .fill(process.env.VALID_USERNAME || "");

    // Click the login button
    await page.getByTestId(loginLocators.testId.loginButtonId).click();

    // Verify if the error message appears

    await loginComponent.verifyErrorStateIcons(
      loginLocators.testId.errorMessageId,
      "Epic sadface: Password is required",
    );
  });
});
