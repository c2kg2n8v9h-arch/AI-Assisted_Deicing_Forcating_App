# Step 10: Optional AI foundation

## Objective

Create vendor-neutral boundaries for LLM, RAG, VectorDB, agents, MCP, guardrails,
and evaluations without making deterministic automation depend on AI.

## What was built and why

`@automation-platform/ai-core` defines ports for every stack layer. Provider
adapters can change independently because projects depend on contracts, not SDKs.
`@automation-platform/ai-worker` is the optional orchestration host.

The default runtime is disabled and has no capabilities. It returns a skipped
advisory result without network activity. Sanitized evidence contains the original
read-only execution summary; advisory output has no replacement test status.

Provider adapter folders separate LLM, retrieval, and vector-store boundaries.
Knowledge manifests record provenance. Versioned eval cases and thresholds remain
in source; generated runs belong under `artifacts/`.

## Architecture

```text
authoritative WebdriverIO result -> sanitized evidence -> input guardrails
  -> retrieval/RAG + VectorDB -> LLM/agent -> MCP tool boundary
  -> output guardrails -> advisory analysis + eval score
```

If an optional component is unavailable, WebdriverIO and Allure remain valid.

## Human reproduction procedure

**Prerequisites:** Steps 1–9 pass. Discuss AI use cases, data classification,
approved providers, and human-approval rules before enabling anything.

1. Create `packages/ai-core` with provider-neutral JSON, evidence, model,
   embedding, retrieval, vector, tool, guardrail, advisory, and eval contracts.
2. Add a disabled runtime with no capability or network dependency.
3. Create `apps/ai-worker` and inject a runtime; keep disabled as the default.
4. Create adapter boundaries without installing a provider.
5. Add a knowledge-manifest template and versioned evaluation cases.
6. Add project references, install from the lockfile, and test.

```bash
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm validate
pnpm test:unit
```

## Expected result

The workspace discovers nine packages. Validation exits `0`. One AI safety unit
test proves a failed authoritative execution remains failed while AI is disabled.
No API key, model call, embedding, vector index, MCP server, or provider exists.

## Troubleshooting

- **Provider type in core:** move it into an adapter and translate at the port.
- **AI output contains pass/fail:** remove it; only the runner owns status.
- **Unsanitized evidence accepted:** require redaction and add a guardrail test.
- **Write tool runs without approval:** reject it when approval context is false.
- **Retrieval lacks citations/provenance:** reject it before model access.
- **Generated eval output is committed:** move it under `artifacts/`.

## Completion checklist

- [ ] LLM, embeddings, RAG, VectorDB, agent, MCP, guardrail, and eval ports exist.
- [ ] No provider dependency leaks into core or projects.
- [ ] AI is disabled by default and makes no network call.
- [ ] Advisory output cannot replace authoritative status.
- [ ] Write tools require explicit approval.
- [ ] Knowledge provenance/classification are required.
- [ ] Eval assets are versioned; generated runs are ignored.
- [ ] Validation and disabled-runtime tests pass.

## Current limitation

This is a safe foundation, not a functioning AI integration. Providers,
credentials, ingestion, agents, and MCP tools require separate security, privacy,
cost, and evaluation approval.

## Authoritative reference

- [OpenAI Evals API reference](https://developers.openai.com/api/reference/resources/evals/methods/create)
