# Step 8: Reporting and observability

## Objective

Make every execution independently traceable, provide a readable Allure report,
and retain useful failure evidence without leaking credentials. Reporting is a
shared platform concern; project tests do not need to know how results are stored.

## What was built and why

### 1. Technology-independent execution contracts

`@automation-platform/contracts` defines execution metadata and summary types.
Keeping these types free of WebdriverIO allows future Playwright, API, mobile, AI,
and portfolio runners to publish the same basic run information.

### 2. Shared observability package

`@automation-platform/observability` creates run metadata and writes sanitized
JSON. Centralizing this behavior gives every adapter one safe and consistent way
to describe a run instead of building reporting logic into test cases.

### 3. One directory per execution

Every run receives a UUID and writes to:

```text
artifacts/executions/<run-id>/
|-- allure-results/
|-- allure-report/
|-- diagnostics/
|-- screenshots/
`-- logs/
    |-- browser/
    `-- framework/
        |-- metadata.json
        `-- summary.json
```

This isolation prevents a new run from silently mixing with or overwriting an
older run. `artifacts/executions/latest-run.txt` is a convenience pointer used by
the report commands; it is not the source of truth for historical results.

### 4. Allure adapter and local report generator

The runner emits Allure result files, environment information, executor metadata,
test steps, and failure screenshots. A workspace-local Allure CLI generates HTML,
which makes the setup reproducible and avoids relying on a machine-wide install.
Java is required by the Allure command-line application.

Low-level WebdriverIO command reporting is disabled deliberately. Commands such as
`setValue` can expose the value typed into a password field. Business-level test
steps remain visible and useful without retaining those command payloads.

### 5. Sanitized failure evidence

On failure, the adapter records a screenshot and a structured diagnostic containing
the test identity and sanitized error information. It never intentionally records
the current page source, cookies, authorization headers, or form values. Avoiding
unnecessary collection is safer than attempting to redact everything afterward.

### 6. Browser artifact retention boundary

Browser processes can create profiles, caches, and diagnostic files outside the
reporter's direct control. At run completion, the framework retains sanitized
`.log` files only and removes transient browser profiles, caches, and other files
from the execution folder. This keeps the evidence set small and auditable.

### 7. Artifact security verification

`report:verify` scans every retained file in the latest execution as raw bytes.
It fails if any configured sensitive value is found. The reference project passes
its public demonstration passwords through `SENSITIVE_SCAN_VALUES`; real projects
should source values from an approved secret store and never commit them.

This verifier is defense in depth. It detects known values but cannot prove that an
unknown secret or unrelated personal data was never collected.

## Commands

Run a test first, then work with its isolated report:

```bash
pnpm test:example:smoke
pnpm report:generate
pnpm report:verify
pnpm report:open
```

`report:open` starts a local Allure web server and remains active until stopped.
Use `pnpm report:clean` to permanently delete generated execution and legacy
report directories. Tests can regenerate them, but the exact deleted run history
cannot be recovered unless it was copied elsewhere.

## Security lesson found during implementation

An early verification run showed that default low-level WebdriverIO attachments
and browser-generated artifacts could retain input values. The generated test
artifacts were deleted, command-step attachments were disabled, browser retention
was narrowed, and the raw-byte verifier was added. No source code or driver cache
was deleted. This is why report security must be tested against actual generated
files rather than inferred only from configuration.

## Verification results

Executed on 2026-09-01 (America/Chicago):

| Verification                       | Result                                 |
| ---------------------------------- | -------------------------------------- |
| Chrome headless smoke test         | 1 selected, 1 passed                   |
| Execution summary                  | `passed`, exit code `0`                |
| Formatting, ESLint, and TypeScript | Passed                                 |
| Allure HTML generation             | Passed                                 |
| Sensitive artifact scan            | 43 files, 2 forbidden values, no match |
| Isolated execution ID              | `eb0509ca-830a-4dcf-9ec8-b0b06d11d69a` |

## Authoritative references

- [Allure Report integration for WebdriverIO](https://allurereport.org/docs/webdriverio/)
- [Generating an Allure Report](https://allurereport.org/docs/v2/generate-report/)

## Human reproduction procedure

**Prerequisites:** Step 7 passes, Java 17+ is available, and a browser can run.

```bash
java -version
pnpm test:example:smoke
pnpm report:generate
pnpm --filter @automation-platform/example-web-project report:verify
pnpm report:open
```

Stop the local report server with `Ctrl+C`. Inspect the generated summary:

```powershell
$runId = (Get-Content -Raw artifacts/executions/latest-run.txt).Trim()
Get-Content -Raw "artifacts/executions/$runId/logs/framework/summary.json"
Test-Path "artifacts/executions/$runId/allure-report/index.html"
```

**Expected result:** status is `passed` with exit code `0`, `index.html` exists,
and the security scan finds no configured values. UUIDs/file counts may vary.

**Troubleshooting:** activate Java if Allure cannot find it; run a test if no latest
run exists; never open/upload evidence after a failed security scan; confirm Allure
results and report use the same run ID if the report is blank.

### Completion checklist

- [ ] Runs are isolated with metadata and accurate summaries.
- [ ] Allure HTML and sanitized failure evidence are generated.
- [ ] Browser profiles/caches are not retained.
- [ ] Raw-byte security scan passes before sharing.
