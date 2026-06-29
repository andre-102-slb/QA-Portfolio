---
id: SMK-LOGIN-01
title: Verify if the username and password fields are visible and clickable
suite: login
group: smoke
priority: high
tags:
  - smoke
  - login
automated: true
automation:
  path: frontend-tests/smoke/login/example.spec.ts
  test: Verify if the username and password fields are visible and clickable
---

## Scenario

The user should visit the website and they should be able to see if the username and password fields are visible and clickable.

## Steps and expectations

1. Go to "https://www.saucedemo.com/"

- Expect Result:
  - User should be able to navigate to the website

2. Verify if the username and password fields appears

- Expect Result:
  - User should be able to see the username and password fields and check if they are clickable
