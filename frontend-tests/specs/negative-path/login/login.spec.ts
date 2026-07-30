import { test } from "@playwright/test";
import { LoginComponent } from "../../../pages";

test.describe("Login Tests Suite", () => {
  let login: LoginComponent;

  test.beforeEach(async ({ page }) => {
    login = new LoginComponent(page);
    await login.open();
  });

  test("LOGIN-07 - Verify if a error message appears after trying to login without password", async () => {
    await login.submitWithoutPassword();
    await login.expectError("Epic sadface: Password is required");
  });
});
