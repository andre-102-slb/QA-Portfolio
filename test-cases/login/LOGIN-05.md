---
id: LOGIN-05
title: Verify if a error message appears after trying to login without any credentials
suite: login
group: smoke
priority: high
tags:
  - smoke
  - login
automated: true
automation:
  path: frontend-tests/specs/smoke/login/login.spec.ts
  test: LOGIN-05 - Verify if a error message appears after trying to login without any credentials
precondition: The SauceDemo site is reachable and the login page is the entry point.
steps:
  - action: Go to "https://www.saucedemo.com/"
    expected:
      - User is able to navigate to the website
      - The login page is displayed
  - action: Verify the username and password fields
    expected:
      - Username field is visible and accepts input
      - Password field is visible and accepts input
  - action: Click on the login button
    expected:
      - An error message should appear 
      - An error icon should appear on the text inputs
---

## Scenario

The user visits the website and should be able to try to login without credentials on the app. When they click on the login, the app should return some errors state.
