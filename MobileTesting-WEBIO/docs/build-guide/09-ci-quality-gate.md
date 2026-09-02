# Step 9: CI/CD quality gate

## Objective

Create a repeatable delivery gate that rejects code-quality problems before
browser execution, verifies Chrome and Edge behavior without duplicating tests,
and publishes only evidence that passes the sensitive-data scan.

GitHub Actions is the first delivery adapter because the framework is intended for
GitHub. The framework itself remains CI-system independent: Azure DevOps, GitLab,
Jenkins, or another service can execute the same `pnpm` commands.

## Pipeline flow in plain language

```text
Pull request, main-branch push, or manual request
                    |
          Static quality and unit tests
                    |
             +------+------+
             |             |
        Chrome smoke    Edge smoke
             |             |
        Build Allure   Build Allure
             |             |
        Security scan Security scan
             |             |
        Upload only if the scan passed
```

The browser jobs wait for the quality job. There is no value spending browser
minutes on code that does not format, lint, compile, or pass its fast unit tests.

## What was built and why

### 1. Reusable workspace setup action

`.github/actions/setup-workspace/action.yml` installs Node.js 24, reads the exact
pnpm version from `package.json`, caches pnpm's shared package store, and installs
with `--frozen-lockfile --strict-peer-dependencies`.

The frozen lockfile prevents CI from silently selecting dependency versions that
were not reviewed locally. Strict peer validation catches incompatible tooling
relationships early. Caching improves speed but does not cache `node_modules`, so
each job still constructs dependencies from the lockfile.

### 2. Fast quality job

The Ubuntu quality job runs `pnpm validate` and `pnpm test:unit`. It contains no
browser dependency, so it is cheaper and faster than the Windows execution jobs.

### 3. Windows Chrome/Edge matrix

The browser job uses `windows-latest`, whose hosted image includes Chrome, Edge,
matching drivers, and Java. Java supports local Allure HTML generation. The matrix
changes only the `BROWSER` environment value; both legs run the same project smoke
test and CI profile.

`fail-fast: false` lets Edge finish if Chrome fails, or vice versa. This produces a
complete compatibility picture rather than cancelling useful evidence after the
first failure.

### 4. Failure-resilient reporting

Report generation and security verification use `always()`, so they still run when
a browser assertion fails. The original failed test keeps the job red, while the
report remains available for diagnosis.

Evidence upload has a stricter condition: the artifact scan must succeed. If a
known sensitive value is detected, GitHub receives no execution artifact from
that matrix leg. This avoids turning reporting convenience into a leak channel.

Artifacts use browser- and workflow-specific names and a 14-day retention period.
Short retention reduces storage and exposure while preserving a useful diagnostic
window. Portfolio governance can change this value centrally.

### 5. Least privilege and concurrency

The workflow grants the generated GitHub token read-only repository-content
permission and checkout does not retain credentials. A newer run for the same
branch cancels an older in-progress run, preventing stale feedback and wasted
runner time. Job timeouts prevent indefinitely hung infrastructure.

### 6. Controlled dependency updates

`.github/dependabot.yml` requests weekly pull requests for GitHub Actions and npm
dependencies. Updates remain reviewable and must pass the same quality gate; they
are not silently applied to execution environments.

## Commands used by any CI platform

```bash
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm validate
pnpm test:unit
pnpm test:example:ci
pnpm report:generate
pnpm --filter @automation-platform/example-web-project report:verify
```

Set `BROWSER=chrome` or `BROWSER=edge` for each browser job. A new project can add
its own `test:ci` entry while reusing the shared runner and reporting commands.

## Verification results

Executed locally on 2026-09-01 (America/Chicago):

| Verification                       | Result                                 |
| ---------------------------------- | -------------------------------------- |
| Formatting, ESLint, and TypeScript | Passed                                 |
| Project configuration resolution   | Passed                                 |
| Chrome CI smoke simulation         | 1 selected, 1 passed                   |
| Chrome artifact scan               | 43 files, 2 forbidden values, no match |
| Edge CI smoke simulation           | 1 selected, 1 passed                   |
| Edge artifact scan                 | 43 files, 2 forbidden values, no match |

The workflow file has been created and locally validated but has not been pushed
or executed by GitHub Actions. Its first hosted run will occur only after the
workspace becomes a GitHub repository and the workflow reaches GitHub.

## Authoritative references

- [GitHub-hosted Windows runner inventory](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md)
- [Checkout action and recommended permissions](https://github.com/actions/checkout)
- [Node setup and pnpm caching](https://github.com/actions/setup-node)
- [pnpm setup action](https://github.com/pnpm/setup)
- [Artifact upload action](https://github.com/actions/upload-artifact)
- [GitHub dependency caching reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)

## Human reproduction procedure

**Prerequisites:** Steps 1–8 pass, the lockfile is current, and GitHub-hosted
runners/artifact retention are permitted.

Review `.github/actions/setup-workspace/action.yml`,
`.github/workflows/automation-quality-gate.yml`, and `.github/dependabot.yml`.

```bash
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm validate
pnpm test:unit
```

```powershell
$env:BROWSER = 'chrome'
pnpm test:example:ci
pnpm report:generate
pnpm --filter @automation-platform/example-web-project report:verify

$env:BROWSER = 'edge'
pnpm test:example:ci
pnpm report:generate
pnpm --filter @automation-platform/example-web-project report:verify
Remove-Item Env:BROWSER -ErrorAction SilentlyContinue
```

After a separately approved push, manually run the hosted workflow once and confirm
the quality job gates two browser jobs and each browser owns its artifact.

**Expected result:** local gates exit `0`, each browser reports one smoke pass, and
report scans pass. Hosted execution remains unverified until pushed.

**Troubleshooting:** intentionally regenerate/review a stale lockfile rather than
removing `--frozen-lockfile`; treat a cache miss as performance-only; inspect the
one browser's sanitized artifact when a matrix leg fails; a skipped upload normally
means the security scan blocked it; verify trigger/branch paths if CI does not start.

### Completion checklist

- [ ] Frozen, reusable setup gates quality before browser jobs.
- [ ] One matrix command covers Chrome and Edge.
- [ ] Reporting survives failures, but unsafe evidence cannot upload.
- [ ] Permissions, timeouts, concurrency, retention, and updates are governed.
- [ ] Local simulation passes and hosted status is stated honestly.
