import { Page, expect } from "@playwright/test";
import { inventoryLocators } from "../locators";

const DEFAULT_PRODUCTS = [
  "Sauce Labs Backpack",
  "Sauce Labs Bike Light",
  "Sauce Labs Bolt T-Shirt",
  "Sauce Labs Fleece Jacket",
  "Sauce Labs Onesie",
  "Test.allTheThings() T-Shirt (Red)",
];

export class InventoryComponent {
  constructor(private page: Page) {}

  async expectProductsVisible(productNames = DEFAULT_PRODUCTS) {
    const items = this.page.getByTestId(inventoryLocators.testId.inventoryItem);
    for (const name of productNames) {
      await expect(
        items.getByRole("link").filter({ hasText: name }),
      ).toBeVisible();
    }
  }

  async sortByPriceHighToLow() {
    await this.page
      .getByTestId(inventoryLocators.testId.productSort)
      .selectOption("Price (high to low)");
  }

  async expectPricesSortedHighToLow() {
    const prices = (
      await this.page
        .getByTestId(inventoryLocators.testId.inventoryItemPrice)
        .allTextContents()
    ).map((text) => Number(text.replace("$", "")));

    expect(prices.length).toBeGreaterThan(1);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  }
}
