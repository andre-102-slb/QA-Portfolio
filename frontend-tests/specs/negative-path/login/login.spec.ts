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
      "Epic sadface: Password is require",
    );
  });
});
