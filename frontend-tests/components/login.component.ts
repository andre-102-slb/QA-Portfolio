import { Page, expect } from "@playwright/test";
import { loginLocators } from "../locators";

export class LoginComponent {
  constructor(private page: Page) {
    this.page = page;
  }
  async verifyErrorStateIcons(locator?: string, expectedText?: string) {
    // Verify if the error icon is visible
    const errorIconCount = await this.page
      .locator(loginLocators.class.errorIcon)
      .count();
    for (let i = 0; i < errorIconCount; i++) {
      await expect(
        this.page.locator(loginLocators.class.errorIcon).nth(i),
      ).toBeVisible();
    }
    if (locator && expectedText) {
      await expect(this.page.getByTestId(locator)).toHaveText(expectedText);
    }
  }
}
