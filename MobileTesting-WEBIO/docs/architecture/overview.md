# Architecture overview

## Purpose

The Automation Intelligence Platform separates stable automation concerns from
technology, project, domain, and AI-provider details.

## Layers

### Portfolio and project layer

Owns application scenarios, screens or pages, project test data, and expected
business outcomes.

### Execution layer

Owns WebdriverIO and future technology runners. It translates shared test intent
into technology-specific browser, mobile, API, or other actions.

### Platform layer

Owns typed contracts, configuration conventions, reporting, evidence,
observability, security, and reusable data abstractions.

### Intelligence layer

Owns optional model access, retrieval, vector-store adapters, agent workflows,
guardrails, and evaluations. It receives sanitized inputs and produces validated,
advisory outputs.

### Integration and infrastructure layer

Owns MCP boundaries, CI execution, containers, grids, and operational monitoring.

## Authoritative flow

```text
project test -> runner -> deterministic assertion -> test result -> report
```

## Optional intelligence flow

```text
sanitized evidence -> retrieval/AI workflow -> guardrails -> advisory analysis
```

The optional flow cannot overwrite the authoritative test result.
