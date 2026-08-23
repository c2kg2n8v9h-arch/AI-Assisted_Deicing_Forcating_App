# Safety and field-validation gate

Yuva is a prototype and must not be enabled for live operational decisions until
the following evidence is reviewed and approved by the accountable operator.

## Required field validation

- Contextual observation with drivers and sprayers using representative trucks.
- Glove, low-light, glare, noise, vibration, snow, and freezing-rain usability.
- Single-operator and two-person workflows.
- Connectivity loss, clock drift, stale weather, duplicate message, and replay.
- Wrong-aircraft selection, reassignment, equipment failure, interruption,
  handoff, abort, and retreatment.
- Dispatcher review, modification, rejection, and radio fallback.

## Required safety evidence

- Approved intended use and explicit non-authority boundaries.
- Hazard analysis with mitigations, owners, and residual-risk acceptance.
- Traceability from approved procedures to requirements and verification tests.
- Human-factors assessment proving the interface does not increase distraction.
- Validation of each estimator on representative station data, including error
  distribution and conservative behavior outside its approved operating range.
- Independent security review and penetration test.
- Backup, recovery, incident-response, and degraded-mode exercises.
- Current, approved, integrity-protected weather, fluid, aircraft, and procedure
  reference data.

## Release rule

Failure or absence of any required evidence keeps the affected feature in
advisory prototype mode. No software result may declare an aircraft clean,
override an approved procedure, or authorize departure.
