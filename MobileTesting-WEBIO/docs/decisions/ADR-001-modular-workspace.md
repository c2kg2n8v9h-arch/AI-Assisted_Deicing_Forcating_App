# ADR-001: Use a modular workspace architecture

- **Status:** Accepted
- **Decision date:** 2026-09-01

## Context

The framework must begin with WebdriverIO and TypeScript, support optional AI/RAG,
vector stores, agents, MCP, guardrails, and evaluations, and remain reusable across
projects, domains, portfolios, and future technologies.

## Decision

Use a pnpm workspace with executable applications, project and domain modules,
technology-independent packages, provider adapters, governance assets, and
separate generated artifacts.

## Consequences

### Benefits

- Explicit ownership and dependency boundaries
- Replaceable runners, models, and storage providers
- Independent testing and release of capabilities
- Normal test execution remains independent of AI availability
- Clear path from one project to a portfolio platform

### Costs

- More initial structure than a single WebdriverIO project
- Requires package-boundary discipline
- Needs workspace-aware build and CI commands

## Guard against overengineering

Folders describe the target boundaries, but packages are implemented only when a
real use case requires them. The initial delivery focuses on the WebdriverIO path.
