# Step 7: Environment, suite, and security management

## Objective

Remove project URLs and suite selection from command implementation, establish
reusable typed configuration contracts, and protect automation and future AI
evidence from accidental secret disclosure.

## Shared packages

### Contracts

`@automation-platform/contracts` defines technology-independent environment,
suite, and project execution types. It has no dependency on WebdriverIO or a
business project.

### Configuration

`@automation-platform/configuration` reads a project's JSON file and validates:

- Project identifier
- Default environment
- Local, QA, staging, and production URLs
- Project spec boundary
- All, smoke, and regression suite metadata

Invalid JSON, missing fields, invalid URLs, or unknown environment names fail
before browser startup. Wrapped file errors preserve their original cause.

### Security

`@automation-platform/security` redacts common sensitive keys, bearer tokens, and
secret assignments. It is intended for logs, reports, MCP exchanges, RAG
ingestion, and AI failure-analysis evidence.

## Project configuration

The example project now owns `project.config.json`. Its package scripts provide
only the config path, browser, profile, and suite. The shared runner loads the
validated configuration without importing or knowing the project.

The example is a training project, so all named environments point to the same
public demonstration URL. Enterprise projects should use separately approved
endpoints and access controls.

## Suite selection

The project declares grep expressions for `[smoke]` and `[regression]`. The runner
passes the selected expression to Mocha. Test categorization therefore remains
project-owned while execution remains runner-owned.

## Production guard

`TARGET_ENV=production` is rejected unless `ALLOW_PRODUCTION=true` is explicitly
set. The check occurs while loading configuration, before WebdriverIO creates a
browser session.

## Commands

```bash
pnpm test:example:smoke
pnpm test:example:regression
pnpm test:unit
```

## Verification results

Executed on 2026-09-01 (America/Chicago):

| Verification                                 | Result               |
| -------------------------------------------- | -------------------- |
| Workspace installation and peer dependencies | Passed               |
| Formatting, ESLint, and TypeScript           | Passed               |
| Security redaction unit tests                | 2 passed             |
| Default QA configuration                     | Passed               |
| Smoke suite resolution                       | Passed               |
| Production execution without opt-in          | Correctly blocked    |
| Chrome smoke suite                           | 1 selected, 1 passed |
| Chrome regression suite                      | 1 selected, 1 passed |

No test code was duplicated between suites, and no browser session was created
for the rejected production configuration.

## Human reproduction procedure

**Prerequisites:** Step 6 passes; environment/suite names and production policy are
approved; real secrets exist only in an approved secret store.

Create the contracts, configuration, and security workspace packages from the
reviewed repository templates. Put URLs and suite expressions in the project's
`project.config.json`.

```bash
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm validate
pnpm test:unit
pnpm test:example:smoke
pnpm test:example:regression
```

The following safety check is expected to fail before opening a browser:

```powershell
$env:TARGET_ENV = 'production'
Remove-Item Env:ALLOW_PRODUCTION -ErrorAction SilentlyContinue
pnpm test:example:smoke
Remove-Item Env:TARGET_ENV -ErrorAction SilentlyContinue
```

**Expected result:** two redaction unit tests pass; smoke/regression select one test
each; unauthorized production execution exits non-zero before a session starts.

**Troubleshooting:** compare unknown names with case-sensitive JSON keys; check URL
and regex escaping; if a secret appears, stop, remove the artifact, rotate real
credentials, and add a regression test; treat a bypassed production guard as a
release blocker.

### Completion checklist

- [ ] Shared contracts have no runner/project dependency.
- [ ] Project owns URL, spec, and suite configuration.
- [ ] Suite selection and redaction unit tests pass.
- [ ] Production is blocked before startup without explicit authorization.
- [ ] Credential policy is documented and followed.
