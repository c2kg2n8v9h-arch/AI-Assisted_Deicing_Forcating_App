# Step 5: WebdriverIO runner foundation

## Objective

Create a reusable WebdriverIO execution adapter for Chrome and Microsoft Edge
without placing application-specific tests inside the runner.

## Environment assessment

The development machine contains:

- Google Chrome 152.0.7977.65
- Microsoft Edge 152.0.4191.53
- No standalone ChromeDriver or EdgeDriver initially available on `PATH`

Chrome is the default browser. `BROWSER=edge` selects Edge. Browser and driver
binary paths can be supplied explicitly when automatic discovery is unsuitable.

## Dependencies

| Dependency              | Reason                                             |
| ----------------------- | -------------------------------------------------- |
| `@wdio/cli`             | WebdriverIO command-line test runner               |
| `@wdio/local-runner`    | Isolated local worker processes                    |
| `@wdio/mocha-framework` | Mocha BDD test organization                        |
| `@wdio/spec-reporter`   | Readable terminal results                          |
| `@wdio/allure-reporter` | Structured report evidence                         |
| `@wdio/globals`         | Typed browser, element, and assertion globals      |
| `@wdio/types`           | Typed WebdriverIO configuration contracts          |
| `tsx`                   | Execute TypeScript configuration at runtime        |
| `@types/mocha`          | Mocha TypeScript declarations                      |
| `dotenv`                | Load local environment configuration               |
| `zod`                   | Validate environment values before browser startup |
| `cross-env`             | Cross-platform environment variables in scripts    |

## Supply-chain build policy

pnpm blocked dependency lifecycle scripts until reviewed. The workspace policy
explicitly allows only:

- `esbuild`, required by the TypeScript execution toolchain
- `edgedriver`, used by Edge driver management

`geckodriver` is explicitly denied because Firefox is outside the approved scope.
The EdgeDriver package's optional Unix-style install command skipped its immediate
download on Windows. WebdriverIO may obtain the matching driver at session start,
or `EDGEDRIVER_PATH` can point to an approved local binary.

## Configuration profiles

| Profile    | Purpose                 | Headless | Spec retry |
| ---------- | ----------------------- | -------- | ---------- |
| `local`    | Developer investigation | Optional | 0          |
| `headless` | Fast local automation   | Yes      | 0          |
| `ci`       | Pipeline execution      | Yes      | 1          |

The retry is applied only at the spec-file level in CI. A retried pass must still
be investigated as potential flakiness; retries must not conceal unstable tests.

## Evidence lifecycle

Before execution, the runner creates Git-ignored artifact directories. After a
failed test it captures a timestamped, filesystem-safe screenshot. WebdriverIO
logs and Allure results are written under `artifacts/`.

## Environment keys

See `.env.example`. Important values include `BASE_URL`, `BROWSER`, `RUN_MODE`,
`HEADLESS`, `MAX_INSTANCES`, browser binary overrides, driver path overrides, and
`SPEC_GLOB`. Invalid values fail before a browser is opened.

## Commands

```bash
pnpm wdio:config:check
pnpm test:web:chrome
pnpm test:web:edge
pnpm test:web:headless
pnpm test:web:ci
```

Browser execution is intentionally deferred until a project and example test are
created in the next approved implementation step.

## Verification criteria

1. Dependency peers have no unresolved compatibility errors.
2. The configuration loader validates Chrome and Edge profiles.
3. Formatting and ESLint checks pass with zero warnings.
4. TypeScript builds the runner through the root project reference.
5. No application-specific selector or test is coupled to the runner.

## Human reproduction procedure

**Prerequisites:** Step 4 passes; Chrome/Edge and approved registry access exist.

Create `apps/runners/webdriverio` using its current manifest, TypeScript reference,
`wdio.conf.ts`, profile files, and runtime modules as reviewed templates.

```bash
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm peers check
pnpm wdio:config:check
pnpm validate
```

```powershell
$env:BROWSER = 'chrome'; pnpm wdio:config:check
$env:BROWSER = 'edge'; pnpm wdio:config:check
Remove-Item Env:BROWSER -ErrorAction SilentlyContinue
```

**Expected result:** both browser/profile configurations print a validated summary;
no application test starts yet.

**Troubleshooting:** provide `CHROME_BINARY`/`EDGE_BINARY` if discovery fails;
provide an approved driver path if network resolution is blocked; update mismatched
browser/driver versions; ensure Zod validation precedes capability creation.

### Completion checklist

- [ ] Runner is a separate workspace package.
- [ ] Chrome/Edge and local/headless/CI profiles validate.
- [ ] Environment input is validated before startup.
- [ ] Build scripts are explicitly allowlisted.
- [ ] Runner contains no project selectors, URL, credentials, or assertions.
