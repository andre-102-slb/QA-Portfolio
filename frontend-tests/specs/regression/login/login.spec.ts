import { test } from "@playwright/test";
import { LoginComponent } from "../../../pages";

test.describe("Login Tests Suite", () => {
  let login: LoginComponent;

  test.beforeEach(async ({ page }) => {
    login = new LoginComponent(page);
    await login.open();
  });

  test("LOGIN-02 - Verify if the block user message appears", async () => {
    await login.loginWithBlockedUser();
    await login.expectError(
      "Epic sadface: Sorry, this user has been locked out.",
    );
  });

  test("LOGIN-03 - Verify if the error button cleans the error message and the icons", async () => {
    await login.loginWithBlockedUser();
    await login.dismissError();
    await login.expectErrorCleared();
  });

  test("LOGIN-06 - Verify if a error message appears after trying to login without username", async () => {
    await login.submitWithoutCredentials();
    await login.expectError("Epic sadface: Username is required");
  });

  test("LOGIN-07 - Verify if a error message appears after trying to login without password", async () => {
    await login.submitWithoutPassword();
    await login.expectError("Epic sadface: Password is required");
  });
});
