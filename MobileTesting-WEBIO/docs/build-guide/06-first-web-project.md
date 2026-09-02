# Step 6: First reusable web project

## Objective

Prove that an application-specific project can consume the shared WebdriverIO
runner without placing its selectors, test data, or business assertions inside
the runner.

## Target application

The approved default is `https://the-internet.herokuapp.com`. Its login page
publishes training credentials and documents that invalid information should
produce an error. These credentials are public test data, not secrets.

## Organization decision

The project is organized by business feature:

```text
authentication/
  login.data.ts
  login.page.ts
  login.spec.ts
```

This keeps the scenario, page behavior, and typed data close together. A global
page-object directory often becomes difficult to own in a large portfolio.

Project-local shared behavior currently contains a base page and flash-message
component. They are deliberately not promoted to platform packages yet. Reuse
should be demonstrated by more than one project before creating a global API.

## Page-object responsibilities

The page object owns selectors and user actions such as opening the login page
and submitting credentials. Assertions stay in the specification so the business
outcome remains visible to readers of the test.

Selectors are accessed through getters. This resolves the browser element at the
time of use rather than storing an element that can become stale after navigation.

## Typed test data

`LoginCredentials` defines the required username and password. Test-data objects
use TypeScript's `satisfies` operator so invalid shapes fail during type checking
without losing their precise inferred values.

## Test categories

- `[smoke]`: verifies the critical successful-login path.
- `[regression]`: verifies invalid-password behavior and user feedback.

Tags are initially embedded in test titles for clear reports. A later test-suite
configuration step can introduce centralized suite selection as the inventory
grows.

## Project-to-runner boundary

Project scripts provide `BASE_URL`, `SPEC_GLOB`, browser, and profile values. The
runner resolves relative spec patterns from the workspace root. Therefore, the
runner knows how to execute tests but does not know which application it is
testing.

## Commands

```bash
pnpm test:example:chrome
pnpm test:example:edge
pnpm test:example:headless
```

## Verification criteria

1. Workspace dependency installation succeeds.
2. Formatting, ESLint, and TypeScript checks pass.
3. Project configuration resolves only the project's specifications.
4. Both login scenarios pass in Chrome.
5. Both scenarios pass in Edge when a compatible driver can be obtained.
6. All runtime output remains under the ignored `artifacts/` directory.

## Verification results

Executed on 2026-09-01 (America/Chicago):

| Browser        | Version       | Specifications | Tests | Result |
| -------------- | ------------- | -------------: | ----: | ------ |
| Google Chrome  | 152.0.7977.65 |              1 |     2 | Passed |
| Microsoft Edge | 152.0.4191.53 |              1 |     2 | Passed |

The same specification and page objects ran unchanged in both browsers. The
smoke and regression scenarios passed. Allure result files, driver cache, and
WebdriverIO logs were generated under `artifacts/`. No failure screenshot was
expected because no test failed.

## Human reproduction procedure

**Prerequisites:** Step 5 passes, both browsers exist, and the training site is
reachable.

Create `projects/example-web-project` from its current manifest and TypeScript
template. Add typed data, page object, and specification under `authentication/`.
Keep selectors/actions in the page object and outcomes in the specification.

```bash
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm validate
pnpm --filter @automation-platform/example-web-project config:check
pnpm test:example:chrome
pnpm test:example:edge
```

**Expected result:** each browser executes the same specification, reports two
passing scenarios, and writes output only under `artifacts/`.

**Troubleshooting:** verify network/proxy access if the site is unreachable; update
project page objects—not the runner—if the page changes; compare saved logs for a
single-browser failure; check the project spec boundary if discovery fails.

### Completion checklist

- [ ] Project is an independent workspace.
- [ ] Data, selectors, actions, and assertions have clear ownership.
- [ ] The identical tests pass in Chrome and Edge.
- [ ] Runner has no training-application dependency.
- [ ] Runtime output is ignored by Git.
