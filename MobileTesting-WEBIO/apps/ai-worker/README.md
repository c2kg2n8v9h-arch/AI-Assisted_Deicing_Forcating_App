# AI worker

Hosts optional AI workflows such as failure triage, requirement-to-test drafting,
and coverage analysis. It consumes sanitized evidence through shared contracts.
It must never determine the authoritative pass/fail status of a test run.

The current implementation is deliberately disabled. `createAiWorker()` uses
`createDisabledAiRuntime()` unless an explicitly configured runtime is injected.
It performs no network calls and needs no API key.

```text
sanitized evidence -> input guardrails -> retrieval -> model/agent
                   -> output guardrails -> advisory result -> evals
```

Write tools require explicit approval at invocation time. Read tools still require
authorization and scope controls.
