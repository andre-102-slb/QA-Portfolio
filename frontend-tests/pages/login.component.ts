import { Page, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { loginLocators } from "../locators";

export class LoginComponent {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto("/");
  }

  async expectLoginPageReady() {
    await expect(
      this.page.getByText(loginLocators.text.appTitle),
    ).toHaveText("Swag Labs");
    await this.expectFieldReady(loginLocators.testId.usernameId);
    await this.expectFieldReady(loginLocators.testId.passwordId);
    await this.expectFieldReady(loginLocators.testId.loginButtonId);
  }

  async login(username: string, password: string) {
    await this.page
      .getByTestId(loginLocators.testId.usernameId)
      .fill(username);
    await this.page
      .getByTestId(loginLocators.testId.passwordId)
      .fill(password);
    await this.submit();
  }

  async loginWithValidCredentials() {
    await this.login(
      process.env.VALID_USERNAME || "",
      process.env.VALID_PASSWORD || "",
    );
  }

  async loginWithBlockedUser() {
    await this.login(
      process.env.BLOCKED_USERNAME || "",
      process.env.VALID_PASSWORD || "",
    );
  }

  async loginWithInvalidCredentials() {
    await this.login(faker.internet.username(), faker.internet.password());
  }

  async submitWithoutCredentials() {
    await this.submit();
  }

  async submitWithoutPassword() {
    await this.page
      .getByTestId(loginLocators.testId.usernameId)
      .fill(process.env.VALID_USERNAME || "");
    await this.submit();
  }

  async dismissError() {
    await this.page.getByTestId(loginLocators.testId.errorButtonId).click();
  }

  async expectError(message: string) {
    const error = this.page.getByTestId(loginLocators.testId.errorMessageId);
    await expect(error).toBeVisible();
    await expect(error).toHaveText(message);

    const errorIcons = this.page.locator(loginLocators.class.errorIcon);
    const count = await errorIcons.count();
    for (let i = 0; i < count; i++) {
      await expect(errorIcons.nth(i)).toBeVisible();
    }
  }

  async expectErrorCleared() {
    await expect(
      this.page.locator(loginLocators.class.errorIcon),
    ).not.toBeVisible();
  }

  private async submit() {
    await this.page.getByTestId(loginLocators.testId.loginButtonId).click();
  }

  private async expectFieldReady(testId: string) {
    const field = this.page.getByTestId(testId);
    await expect(field).toBeVisible();
    await expect(field).toBeEnabled();
  }
}
