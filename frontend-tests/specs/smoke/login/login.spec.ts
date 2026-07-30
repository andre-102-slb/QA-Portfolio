import { test } from "@playwright/test";
import { InventoryComponent, LoginComponent } from "../../../pages";

test.describe("Login Tests Suite", () => {
  let login: LoginComponent;
  let inventory: InventoryComponent;

  test.beforeEach(async ({ page }) => {
    login = new LoginComponent(page);
    inventory = new InventoryComponent(page);
    await login.open();
  });

  test("LOGIN-01 - Verify if the username and password fields are visible and clickable", async () => {
    await login.expectLoginPageReady();
  });

  test("LOGIN-04 - Verify if a error message appears after inserting an invalid credentials", async () => {
    await login.loginWithInvalidCredentials();
    await login.expectError(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });

  test("LOGIN-05 - Verify if a error message appears after trying to login without any credentials", async () => {
    await login.submitWithoutCredentials();
    await login.expectError("Epic sadface: Username is required");
  });

  test("LOGIN-06 - Verify if the user can login with a valid credentials", async () => {
    await login.loginWithValidCredentials();
    await inventory.expectProductsVisible();
  });

  test("inventory sorts by price high to low", async () => {
    await login.loginWithValidCredentials();
    await inventory.sortByPriceHighToLow();
    await inventory.expectPricesSortedHighToLow();
  });
});
