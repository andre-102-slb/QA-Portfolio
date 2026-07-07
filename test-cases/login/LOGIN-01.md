---
id: LOGIN-01
title: Verify if the username and password fields are visible and clickable
suite: login
group: smoke
priority: high
tags:
  - smoke
  - login
automated: true
automation:
  path: frontend-tests/specs/smoke/login/login.spec.ts
  test: LOGIN-01 - Verify if the username and password fields are visible and clickable
precondition: The SauceDemo site is reachable and the login page is the entry point.
steps:
  - action: Go to "https://www.saucedemo.com/"
    expected:
      - User is able to navigate to the website
      - The login page is displayed
      - The user is able to see the page tittle "Swag Labs"
      - Username field is visible and accepts input
      - Password field is visible and accepts input
---

## Scenario

The user visits the website and should be able to see whether the username and password fields are visible and clickable before signing in.
