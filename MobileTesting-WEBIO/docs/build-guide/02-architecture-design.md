# Step 2: Architecture design

## Objective

Define a framework that supports WebdriverIO today while remaining reusable for
other projects, domains, portfolios, and execution technologies.

## Decision

Use a modular TypeScript workspace with five separable concerns:

1. Deterministic test execution
2. Optional AI intelligence
3. External integration through controlled adapters and MCP servers
4. Security, guardrails, evaluation, and governance
5. Infrastructure and generated evidence

## Key rules

- WebdriverIO-specific code stays in its runner or adapter.
- Application-specific selectors and business tests stay in a project.
- Reusable domain language stays separate from project implementation details.
- Shared code communicates through typed contracts.
- AI is advisory and disabled by default.
- Secrets and generated evidence are not committed.
- Provider-specific implementations sit behind adapters.

## Why this design was selected

A traditional page-object framework is easy to start but becomes tightly coupled
when several projects and technologies share it. A single additional `ai` folder
also becomes a mixed-responsibility area. Workspace packages make ownership,
dependencies, replacement, testing, and future extraction explicit.

## Alternatives considered

- **Single WebdriverIO project:** simpler, but insufficient for portfolio reuse.
- **WebdriverIO project plus one AI folder:** useful for a prototype, but weak
  boundaries between models, retrieval, agents, guardrails, and evaluations.
- **Immediately implement every future package:** rejected because empty
  abstractions create maintenance cost without proven use cases.

The approved approach establishes boundaries now and implements capabilities
incrementally.

## Human reproduction procedure

**Prerequisites:** Step 1 is complete and expected projects, domains, technologies,
and owners are understood.

1. List today's technology and plausible future changes.
2. Classify capabilities as runner, project, domain, shared platform,
   infrastructure, evidence, or optional AI.
3. Create/review `docs/architecture/overview.md`, `dependency-rules.md`, the
   modular-workspace ADR, and onboarding guide.
4. Confirm a project can be added without editing the runner.
5. Reject cycles and direct project-to-provider dependencies.
6. Record alternatives and obtain human approval.

**Expected result:** engineers can place selectors, tests, contracts, runner code,
reports, and AI adapters without guessing. AI is advisory and replaceable.

**Troubleshooting:** begin uncertain reuse project-locally; reverse
platform-to-project dependencies through contracts; move AI after deterministic
results; avoid implementing empty abstractions without a use case.

### Completion checklist

- [ ] Ownership and dependency directions are explicit.
- [ ] Deterministic results remain authoritative.
- [ ] Secrets/evidence are excluded from source control.
- [ ] Alternatives, trade-offs, and approval are recorded.
