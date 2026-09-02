# Example web project

This reference project demonstrates how a portfolio team supplies project-owned
configuration, feature tests, and test data while reusing the shared runner.

For CI, set `BROWSER` to `chrome` or `edge` and run:

```bash
pnpm --filter @automation-platform/example-web-project test:ci
```

The command always selects the headless CI profile and smoke suite. The pipeline,
not the test code, supplies the browser matrix value.

This reference project demonstrates how an application consumes the shared
WebdriverIO runner while keeping its selectors, data, and business assertions
inside its own boundary.

## Target

- Application: `https://the-internet.herokuapp.com`
- Feature: authentication
- Tests: successful login and invalid-password handling

The credentials are public training data displayed by the target login page.
They are not production secrets.

## Structure

```text
authentication/
  login.data.ts
  login.page.ts
  login.spec.ts
shared/
  components/
  pages/
```

Feature files stay together. A component should move into a domain or platform
package only when multiple real projects need the same abstraction.

## Commands

Run from the workspace root:

```bash
pnpm test:example:chrome
pnpm test:example:edge
pnpm test:example:headless
pnpm test:example:smoke
pnpm test:example:regression
```

## Environments and suites

`project.config.json` declares local, QA, staging, and production-like profiles.
This training project points all four names to the same public demonstration site;
real projects must provide distinct approved URLs.

QA is the default. Set `TARGET_ENV=staging` to choose another profile. Production
is blocked unless `ALLOW_PRODUCTION=true` is explicitly provided after confirming
the target and test-data safety.

The `smoke` and `regression` commands use suite metadata from the project config,
not hard-coded filtering inside the shared runner.
