import { Page, expect } from "@playwright/test";

export class Helper {
  constructor(private page: Page) {}

  async verifyInputIsVisibleAndEditable(locatorId: string) {
    await expect(this.page.getByTestId(locatorId)).toBeVisible();
    await expect(this.page.getByTestId(locatorId)).toBeEnabled();
  }
}
