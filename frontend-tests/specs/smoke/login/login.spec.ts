import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { Helper } from "../../../utils/helper";
import { loginLocators } from "../../../locators";
import { LoginComponent } from "../../../components";

test.describe("Login Tests Suite", () => {
  let helper: Helper;
  let loginComponent: LoginComponent;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    loginComponent = new LoginComponent(page);
    await page.goto("/");
  });

  test("LOGIN-01 - Verify if the username and password fields are visible and clickable", async ({
    page,
  }) => {
    // Verify the app has the proper title
    await expect(page.getByText(loginLocators.text.appTitle)).toHaveText(
      "Swag Labs",
    );

    // Verify if the username password fields and login button are visible and clickable
    await helper.verifyInputIsVisibleAndEditable(
      loginLocators.testId.usernameId,
    );
    await helper.verifyInputIsVisibleAndEditable(
      loginLocators.testId.passwordId,
    );
    await helper.verifyInputIsVisibleAndEditable(
      loginLocators.testId.loginButtonId,
    );
  });

  test("LOGIN-04 - Verify if a error message appears after inserting an invalid credentials", async ({
    page,
  }) => {
    // Insert a random string on the username field
    await page
      .getByTestId(loginLocators.testId.usernameId)
      .fill(faker.internet.username());

    // Insert a random string on the password field
    await page
      .getByTestId(loginLocators.testId.passwordId)
      .fill(faker.internet.password());

    // Click on the login button
    await page.getByTestId(loginLocators.testId.loginButtonId).click();

    // Verify if the error message appears
    await helper.verifyInputIsVisibleAndEditable(
      loginLocators.testId.errorMessageId,
    );
    await loginComponent.verifyErrorStateIcons(
      loginLocators.testId.errorMessageId,
      "Epic sadface: Username and password do not match any user in this service",
    );
  });

  test("LOGIN-05 - Verify if a error message appears after trying to login without any credentials", async ({
    page,
  }) => {
    // Click on the login button
    await page.getByTestId(loginLocators.testId.loginButtonId).click();
    // Verify if the error message appears
    await helper.verifyInputIsVisibleAndEditable(
      loginLocators.testId.errorMessageId,
    );
    await loginComponent.verifyErrorStateIcons(
      loginLocators.testId.errorMessageId,
      "Epic sadface: Username is required",
    );
  });
});
