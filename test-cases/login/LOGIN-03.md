---
id: LOGIN-03
title: Verify if the error button cleans the error message and the icons
suite: login
group: regression
priority: medium
tags:
  - regression
  - login
automated: true
automation:
  path: frontend-tests/smoke/login/login.spec.ts
  test: Verify if the error button cleans the error message and the icons
precondition: The SauceDemo site is reachable and the login page is the entry point.
steps:
  - action: Go to "https://www.saucedemo.com/"
    expected:
      - User is able to navigate to the website
      - The login page is displayed
  - action: Insert the username - locked_out_user
    expected:
      - Username field accepts input
  - action: Insert the password
    expected:
      - Password field accepts input
  - action: Click on the Login button
    expected:
      - The following message should appear - 'Epic sadface Sorry, this user has been locked out.'
      - The username and the password fields should have an X icon displayed inside the input
  - action: Click on the Close Error message button
    expected:
      - The message should close 
      - The error icons on the input should disappear

---

## Scenario

The user visits the website and should be able to close all the error messages and icons that appears during this flow using the close error button.
