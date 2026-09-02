# Automation Intelligence Platform

This repository is a reusable TypeScript automation platform. Its first execution
adapter will use WebdriverIO, while its shared contracts, reporting, security,
observability, AI, retrieval, guardrail, and evaluation capabilities remain
independent of any single automation technology or business domain.

## Current status

The reusable workspace, WebdriverIO adapter, reference web project,
environment/suite controls, security boundary, and per-execution Allure reporting
are implemented. AI capabilities remain optional future layers and cannot change
the authoritative deterministic test result.

## Architecture at a glance

```text
Portfolio / domain / project tests
                 |
       technology-specific runner
                 |
       shared platform contracts
                 |
 reporting | evidence | security | optional AI
```

The deterministic test result is authoritative. AI analysis is optional and
advisory: a model outage must not prevent normal tests from running or reporting.

## Repository map

| Path                | Responsibility                                             |
| ------------------- | ---------------------------------------------------------- |
| `apps/runners/`     | Executable technology-specific test runners                |
| `apps/ai-worker/`   | Optional AI-assisted workflows                             |
| `apps/mcp-servers/` | Narrowly scoped MCP servers                                |
| `projects/`         | Application-specific tests and configuration               |
| `domains/`          | Reusable business-domain vocabulary and capabilities       |
| `packages/`         | Technology-independent platform packages and adapters      |
| `knowledge/`        | Approved documents available to retrieval workflows        |
| `evals/`            | Versioned AI evaluation datasets and acceptance thresholds |
| `infrastructure/`   | CI, containers, browser grids, and monitoring              |
| `artifacts/`        | Generated reports, evidence, and AI analysis; Git-ignored  |
| `docs/`             | Architecture, decisions, onboarding, and build history     |

## Build documentation

This repository documents not only how to use the framework, but how and why it
was built:

0. [How to use the human-prepared build guide](docs/build-guide/00-how-to-use-this-guide.md)
1. [Repository assessment](docs/build-guide/01-repository-assessment.md)
2. [Architecture design](docs/build-guide/02-architecture-design.md)
3. [Workspace initialization](docs/build-guide/03-workspace-initialization.md)
4. [TypeScript quality foundation](docs/build-guide/04-typescript-quality-foundation.md)
5. [WebdriverIO runner foundation](docs/build-guide/05-webdriverio-runner-foundation.md)
6. [First reusable web project](docs/build-guide/06-first-web-project.md)
7. [Environment, suite, and security management](docs/build-guide/07-environment-suite-security.md)
8. [Reporting and observability](docs/build-guide/08-reporting-observability.md)
9. [CI/CD quality gate](docs/build-guide/09-ci-quality-gate.md)
10. [Optional AI foundation](docs/build-guide/10-optional-ai-foundation.md)
11. [Offline AI evaluation harness](docs/build-guide/11-offline-ai-evaluation-harness.md)

See [architecture overview](docs/architecture/overview.md),
[dependency rules](docs/architecture/dependency-rules.md), and
[adding a new project](docs/onboarding/adding-a-new-project.md).

## Prerequisites

- Node.js 24 is currently available in the development environment.
- pnpm 11.19.0 is the pinned workspace package manager.

## Quality commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm validate
```

`pnpm validate` is the local and CI quality gate. WebdriverIO installation and
configuration can be checked without opening a browser:

```bash
pnpm wdio:config:check
```

Browser execution commands are available but require project test specifications,
which will be created in a later approved step:

```bash
pnpm test:web:chrome
pnpm test:web:edge
pnpm test:web:headless
pnpm test:web:ci
```

The reference project supplies its own URL and spec boundary:

```bash
pnpm test:example:chrome
pnpm test:example:edge
pnpm test:example:headless
pnpm test:example:smoke
pnpm test:example:regression
pnpm test:unit
```

Each run writes to its own `artifacts/executions/<run-id>/` directory. Generate,
open, verify, or clean the latest local report with:

```bash
pnpm report:generate
pnpm report:open
pnpm report:verify
pnpm report:clean
```

`report:verify` scans the latest execution's retained files for sensitive values
provided through secret-named environment variables or `SENSITIVE_SCAN_VALUES`.
The example project supplies its public demo passwords to this scan automatically.

The optional AI layer has a zero-cost, offline evaluation gate:

```bash
pnpm eval:offline
```

## Continuous integration

The local [GitHub Actions quality gate](.github/workflows/automation-quality-gate.yml)
runs static validation and unit tests before a Windows Chrome/Edge smoke matrix.
Each matrix job creates, verifies, and conditionally uploads isolated Allure
evidence. The same behavior can be reproduced locally with:

```bash
pnpm validate
pnpm test:unit
# Set BROWSER to chrome or edge in the shell, then run:
pnpm test:example:ci
pnpm report:generate
pnpm --filter @automation-platform/example-web-project report:verify
```

Project URLs, spec boundaries, and suite selectors are declared in each project's
validated `project.config.json`. Production execution is blocked unless
`ALLOW_PRODUCTION=true` is explicitly supplied. See the
[credential-handling policy](docs/security/credential-handling.md).
