# Projects

Each application under test receives an isolated project workspace containing
its tests, pages or screens, test data, and environment-safe configuration.
Projects consume runners and shared packages; shared packages must not import a
specific project.

Every project also owns its RAG tenant boundary:

- `knowledge/manifest.json` records approved source metadata.
- `rag/retrieval-policy.json` defines project, domain, and shared knowledge order.
- `rag/citation-policy.json` requires citations for AI analysis.
- `rag/access-policy.json` defines allowed consumers and write approval rules.
- `rag/chunking-policy.json` preserves source metadata during indexing.
- `rag/evaluation-set.json` defines grounding, citation, and secret-safety gates.

Use `pnpm rag:validate` before marking a project ready for live advisory AI use.
