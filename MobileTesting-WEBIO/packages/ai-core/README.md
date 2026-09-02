# AI core

This package is the vendor-neutral language of the optional intelligence layer.
It contains interfaces and safe defaults, not a model SDK or database client.

| Stack area | Contract                                        |
| ---------- | ----------------------------------------------- |
| LLM        | `LanguageModelPort`                             |
| Embeddings | `EmbeddingPort`                                 |
| RAG        | `RetrieverPort` and citation-bearing results    |
| VectorDB   | `VectorStorePort`                               |
| AI agent   | `AgentPlan`, `AgentToolPort`, and effect labels |
| MCP        | The same narrow tool contract at server borders |
| Guardrails | `GuardrailPort` and staged decisions            |
| Evals      | `EvaluationCase` and `EvaluationScore`          |

`SanitizedEvidence` requires an authoritative execution summary and the literal
`redacted: true` marker. `AdvisoryAnalysis` has no pass/fail field, so AI cannot
return a replacement WebdriverIO status through this contract.

`createDisabledAiRuntime()` is the default. It has no capabilities and makes no
network call.
