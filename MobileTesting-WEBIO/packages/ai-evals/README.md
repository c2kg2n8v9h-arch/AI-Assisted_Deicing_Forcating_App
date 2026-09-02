# Offline AI evaluation harness

This package evaluates any injected `EvaluationCandidate` without knowing its
provider. It loads versioned JSONL cases, runs composable graders, calculates
per-case and aggregate scores, enforces safety thresholds, and writes sanitized
reports under `artifacts/evals/`.

The included fixture is deterministic and offline. It is test infrastructure, not
an AI model and not a claim about real-model quality.

```bash
pnpm eval:offline
```

Exit code `0` means both overall quality and mandatory safety-case thresholds
passed. A non-zero exit code is a quality-gate failure.
