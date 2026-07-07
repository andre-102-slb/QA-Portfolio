---
id: LOGIN-04
title: Verify if a error message appears after inserting an invalid credentials
suite: login
group: smoke
priority: high
tags:
  - smoke
  - login
automated: true
automation:
  path: frontend-tests/smoke/login/login.spec.ts
  test: Verify if a error message appears after inserting an invalid credentials
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
  - action: Insert a random string on the username 
    expected:
      - Username field accepts the input
  - action: Insert a random string on the password 
    expected:
      - Password field accepts the input
  - action: Click on the login button
    expected:
      - A message saying that the user does not exist should appear 
      - A error icon should appear on the username and passwords input
---

## Scenario

The user visits the website and should be able to insert an invalid credentials on the app. When they click on the login, the app should return some errors state.
