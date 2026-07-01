---
id: LOGIN-XXX
title: Short title of the test case
suite: login
group: smoke
priority: medium
tags:
  - login
automated: false
automation:
  path: frontend-tests/smoke/login/example.spec.ts
  test: exact Playwright test title
precondition: What must be true before this test runs (optional).
steps:
  - action: First action the tester performs
    expected:
      - What should happen after this action
  - action: Second action
    data: Optional test data for this step
    expected:
      - First expected result
      - Second expected result
---

## Scenario

Describe the situation in plain language — who the user is, what they are trying to do, and why this case matters.

Notes:
- `precondition`, `data` and `automation` are optional. Remove them if not used.
- Each step has an `action` and a list of `expected` results, rendered as a stepper.
- Set `automated: true` only when `automation.path` and `automation.test` point to a real Playwright test.
