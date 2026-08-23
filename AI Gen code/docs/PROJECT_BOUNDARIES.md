# Project boundaries

## Primary product: Yuva aircraft deicing

The code under `AI Gen code/` is the primary Yuva product. It provides
advisory-only aircraft deicing queue forecasts, service-time ranges, anomaly
detection, and resource recommendations. It must not declare an aircraft clean,
override an approved procedure, produce an operationally binding result, or
authorize departure.

## Separate reference product: SPM forecasting

`Forecasting app - AI GEN` is a Git submodule linked to the independently
versioned `SPM-forecasting` repository. It is a mock-first maintenance material
readiness and generic forecasting demonstrator. It is not imported, deployed,
or trusted by the deicing runtime.

The submodule may be used as a source of reusable design patterns only. Code
must be deliberately migrated behind Yuva domain contracts and security review;
Yuva must never acquire a runtime dependency on mock identities, mock purchase
orders, or the submodule's local RAG index.

## RAG ownership

`AI Gen code/Yuva/rag` is the authoritative RAG contract for the deicing
product. Its provenance, effective-date, jurisdiction, station, classification,
and checksum requirements take precedence. The SPM RAG implementation remains
development-only and is not approved for deicing documents.

## Repository policy

- Product dependencies belong in package manifests, not committed virtual
  environments or installers.
- Linked worktrees, nested clones, caches, generated indexes, and browser reports
  are local artifacts and must not be committed.
- Each product retains its own build, tests, release process, and security review.
