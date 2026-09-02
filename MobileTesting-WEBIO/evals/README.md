# AI evaluations

This directory will contain versioned datasets, expected outcomes, baselines,
and acceptance thresholds for optional AI behavior. Evaluation results belong in
`artifacts/`; stable datasets and scoring definitions belong here.

Each capability receives a versioned directory, immutable case identifiers, and
explicit thresholds. `failure-triage/v1` is the structural example. It defines
what a later adapter must satisfy but does not invoke a model.

Run the deterministic offline harness with `pnpm eval:offline`. Its sanitized
report is generated under `artifacts/evals/failure-triage/<run-id>/report.json`.
