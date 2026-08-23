# RAG evaluation

Keep reviewed evaluation questions in `datasets/` and generated results in
`results/`. Test at least:

- Retrieval recall for critical procedures and known citations.
- Citation correctness and answer groundedness.
- Rejection of stale or superseded documents.
- Jurisdiction, station, tenant, and role isolation.
- Conflicting-source detection and safe abstention.
- Prompt injection embedded in PDF, HTML, metadata, and retrieved text.
- Missing data, malformed documents, unavailable indexes, and offline behavior.
- Latency and load during expected winter storm concurrency.

Evaluation datasets must not contain unauthorized production or personal data.
