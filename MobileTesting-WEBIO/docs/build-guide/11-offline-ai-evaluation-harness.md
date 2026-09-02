# Step 11: Offline AI evaluation harness

## Objective

Test AI-facing contracts, citations, advisory-only behavior, and safety thresholds
without choosing a provider, using credentials, making network calls, or spending
model tokens.

## What was built and why

`@automation-platform/ai-evals` separates four concerns:

1. A versioned JSONL data source.
2. An injected candidate that produces output.
3. Composable graders that score expected behavior and safety.
4. A run report that applies aggregate thresholds.

This follows the useful evaluation pattern of data source, testing criteria, and
separate run output while remaining local and provider-neutral.

The expected-subset grader verifies structured fields and citations. The advisory
safety grader rejects output containing an authoritative `status` or credential
material. Safety-tagged cases must achieve a 100% pass rate even when the overall
threshold is lower.

The reference candidate is a deterministic fixture. It makes the harness and CI
behavior reproducible; it does not simulate model intelligence.

## Human reproduction procedure

**Prerequisites:** Step 10 passes. The capability, expected behavior, safety
invariants, and acceptance thresholds are reviewed by domain and security owners.

1. Create `packages/ai-evals` and reference `ai-core` and `observability`.
2. Define candidate, grader, case-result, threshold, and report contracts.
3. Load JSONL line by line; reject malformed cases and duplicate identifiers.
4. Validate thresholds are numbers from `0` through `1`.
5. Add expected-subset and advisory-safety graders.
6. Add a deterministic fixture and write sanitized run reports under `artifacts/`.
7. Add unit tests for a passing candidate and a blocked status-changing candidate.
8. Add `pnpm eval:offline` to the CI quality job.

```bash
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm validate
pnpm test:unit
pnpm eval:offline
```

On PowerShell, inspect the latest generated report:

```powershell
$runId = (Get-Content -Raw artifacts/evals/failure-triage/latest-run.txt).Trim()
Get-Content -Raw "artifacts/evals/failure-triage/$runId/report.json"
```

## Expected result

The CLI reports `passed` with overall score `1.00` and safety score `1.00` for the
fixture dataset. Two harness unit tests pass: one accepts safe output and one
rejects an attempted authoritative-status replacement.

## Troubleshooting

- **Invalid JSONL line:** validate that each non-empty line is one complete JSON
  object with unique `id`, `input`, `expected`, and string `tags`.
- **Threshold schema fails:** use numeric values between `0` and `1`.
- **Expected-subset fails:** compare the candidate's structured output and citation
  order with the versioned expected object.
- **Safety score fails:** treat it as blocking; never lower the safety threshold to
  hide status mutation or credential exposure.
- **Fixture passes but real model fails later:** this is expected evidence that the
  provider configuration is not ready; keep AI disabled and improve/evaluate it.
- **Report contains sensitive data:** delete the generated run, fix sanitization and
  dataset design, and rerun before publishing.

## Completion checklist

- [ ] JSONL cases and thresholds are versioned and validated.
- [ ] Candidate and graders are injectable/provider-neutral.
- [ ] Expected structured output and citations are scored.
- [ ] Authoritative status and credential output are rejected.
- [ ] Safety cases require a perfect pass rate.
- [ ] Reports are sanitized and generated only under `artifacts/`.
- [ ] A failing evaluation returns a non-zero process exit code.
- [ ] Unit tests, offline fixture run, and CI quality step pass.

## Current limitation

Passing the deterministic fixture proves the harness, graders, dataset wiring, and
gate—not the quality of a future model. Every real provider/model/prompt/retrieval
configuration must run the same versioned evaluations before enablement.

## Authoritative reference

- [OpenAI evaluation creation reference](https://developers.openai.com/api/reference/java/resources/evals/methods/create)
