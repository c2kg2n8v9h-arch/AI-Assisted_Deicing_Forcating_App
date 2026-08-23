# Yuva Aircraft Deicing Operations Platform

## Business Requirements Document

| Document field | Value |
|---|---|
| Product | Yuva Aircraft Deicing Operations Platform |
| Document type | Business Requirements Document (BRD) |
| Version | 1.0 |
| Status | Draft for stakeholder validation |
| Date | August 23, 2026 |
| Primary users | Deicing drivers, sprayers, dispatchers, supervisors, flight crews, and winter-operations managers |
| Product owner | To be assigned |

## 1. Executive summary

Yuva will provide a secure, offline-capable operational platform for capturing, communicating, and auditing aircraft ground deicing and anti-icing activities.

The principal business problem is fragmented situational awareness. Drivers, sprayers, dispatchers, flight crews, and airport operations may rely on separate clocks, radio conversations, paper forms, vehicle systems, and software records. Under winter operating conditions, these gaps increase workload, cause duplicate data entry, reduce queue visibility, complicate billing and reporting, and may compromise the accuracy of safety-critical information.

Yuva will create one authoritative operational record while preserving human authority over safety decisions. The platform will support field work in cold, noisy, low-visibility environments; remain usable during network outages; communicate safety-critical events through closed-loop acknowledgements; and maintain a tamper-evident audit history.

Yuva is a decision-support and operational-record system. It will not declare an aircraft free of contamination, authorize departure, or replace the responsibilities of qualified deicing personnel, the operator's approved ground deicing program, or the pilot-in-command.

## 2. Purpose

This BRD defines the business objectives, stakeholders, scope, operational capabilities, safety constraints, security and privacy requirements, data-integrity requirements, and success measures for the Yuva platform.

It is intended to align business stakeholders, operational users, product management, design, engineering, security, quality assurance, and regulatory/compliance teams before detailed solution design.

## 3. Background and problem statement

Aircraft deicing is performed in a time-critical and safety-sensitive environment. A frontline operator may simultaneously control a vehicle or boom, apply fluid, observe aircraft surfaces, communicate by radio, monitor environmental conditions, and record treatment information while wearing winter protective equipment.

Current industry products commonly provide work orders, dispatch, GPS location, fluid inventory, pilot messaging, reporting, and billing. However, public industry evidence and operator discussions indicate continuing challenges:

- High interaction burden for users wearing gloves and operating equipment.
- Radio congestion, misunderstood instructions, and missing acknowledgements.
- Duplicate or inconsistent data across truck, dispatch, airline, billing, and environmental systems.
- Manual or ambiguous safety-critical timestamps.
- Rapidly changing weather and uncertainty about the age or source of data.
- Weak support for interrupted treatments, equipment failure, reassignment, handoffs, and retreatment.
- Limited visibility into queues, resource constraints, and dispatch priorities.
- Unreliable ramp connectivity and unclear synchronization status.
- Seasonal staffing, inconsistent training, and differences among stations and contractors.
- Limited transparency about employee tracking, record correction, and the use of operational data for performance management.

Yuva must address these problems without adding distraction or creating a false impression that software has replaced required operational judgment.

## 4. Business objectives

| ID | Objective |
|---|---|
| BO-01 | Reduce frontline data-entry burden and eliminate avoidable duplicate entry. |
| BO-02 | Improve shared situational awareness across drivers, sprayers, dispatchers, supervisors, and flight crews. |
| BO-03 | Improve the accuracy, completeness, timeliness, and traceability of deicing records. |
| BO-04 | Reduce avoidable radio traffic while retaining an explicit and usable radio fallback. |
| BO-05 | Maintain safe operational continuity during intermittent or unavailable network service. |
| BO-06 | Improve truck, crew, pad, and fluid utilization without encouraging unsafe work speed. |
| BO-07 | Provide audit-ready records for safety, operational, environmental, contractual, and billing purposes. |
| BO-08 | Protect employee and operational data through privacy-by-design and security-by-design. |
| BO-09 | Support integration with airline, airport, weather, flight-information, vehicle, and reporting systems. |
| BO-10 | Establish trustworthy operational data that may later support explainable forecasting and optimization. |

## 5. Stakeholders and user groups

| Stakeholder | Primary needs |
|---|---|
| Deicing driver | Clear assignment, safe routing/context, minimal interaction, rapid exception reporting, and reliable offline operation. |
| Sprayer/deicer | Correct aircraft and treatment instructions, easy fluid/treatment capture, clear timing, final-check workflow, and glove-friendly controls. |
| Single-operator truck user | A workflow that does not demand attention while driving, positioning equipment, or spraying. |
| Dispatcher/pad coordinator | Live queue, equipment and crew availability, assignment control, exceptions, acknowledgements, and explainable sequencing. |
| Supervisor | Operational oversight, authorized corrections, qualification verification, incident response, and shift reporting. |
| Flight crew | Timely request status and accurate final treatment/anti-icing information through an approved communication process. |
| Winter-operations manager | Capacity, performance, fluid consumption, service-level, safety, and trend reporting. |
| Airline/airport operations | Predictable milestones and integration with flight and airport collaborative decision-making processes. |
| Safety/compliance/audit | Complete, immutable, reproducible, and exportable evidence. |
| Environmental team | Accurate fluid use, recovery, inventory, and station-level reporting. |
| Billing/finance | Validated treatment quantities, contractual evidence, approvals, and exception handling. |
| IT/security/privacy | Governed access, secure devices and APIs, data minimization, monitoring, retention, recovery, and vulnerability management. |

## 6. Assumptions and constraints

- Each deployment will operate under an airline, airport, or service provider's approved procedures.
- Procedures, terminology, required fields, fluid products, and integration capabilities vary by jurisdiction and station.
- Network connectivity on the ramp cannot be assumed.
- Users may wear gloves and may work in snow, freezing rain, darkness, glare, high noise, and vehicle vibration.
- Vehicle telemetry will differ by vehicle manufacturer and fleet age.
- Weather inputs may include official observations, approved real-time sensors, forecasts, and qualified human observations; their authority is not interchangeable.
- Holdover-time data and fluid data are revised periodically and require controlled updates.
- The organization deploying Yuva remains responsible for regulatory authorization, training, operating procedures, and safety decisions.
- Safety-critical functionality will require formal safety assessment, verification, validation, change control, and operational approval before production use.

## 7. Scope

### 7.1 In scope for the initial product

- User authentication, roles, station assignment, and qualification status.
- Flight and aircraft identification.
- Deicing requests, queues, dispatch, assignment, acceptance, and reassignment.
- Truck, crew, fluid, and equipment-status management.
- One-step and two-step deicing/anti-icing treatment capture.
- Trusted timestamps for treatment events and final anti-icing step.
- Final-check recording by qualified personnel.
- Communication of the approved post-treatment information and acknowledgement status.
- Weather-source display, freshness, and change alerts.
- Offline data capture, synchronization, conflict handling, and visible sync status.
- Interrupted, aborted, handed-off, and repeat-treatment workflows.
- Append-only audit history and authorized corrections.
- Operational, compliance, fluid, environmental, and billing exports.
- Integration APIs and event notifications.
- Security monitoring, privacy controls, retention, backup, and recovery.

### 7.2 Out of scope for the initial product

- Autonomous determination that aircraft surfaces are clean.
- Autonomous authorization for aircraft movement or departure.
- Replacement of ATC, pilot, or qualified deicing-personnel authority.
- Unapproved dynamic holdover-time determination.
- Autonomous vehicle or boom control.
- Employee disciplinary decisions generated solely from analytics.
- Passenger processing or collection of passenger personal data.
- Predictive dispatch until the core operational dataset is demonstrably reliable.

## 8. Target operating principles

1. **Safety before throughput.** No feature may pressure operators to sacrifice required checks or procedures to improve a performance metric.
2. **One event, one authoritative record.** Information should be captured once at its source and reused through controlled integration.
3. **Human authority is explicit.** The system must distinguish a recommendation, warning, imported fact, operator-confirmed fact, and required human decision.
4. **Offline is a normal mode.** Loss of connectivity must be visible and must not prevent safe record capture.
5. **Closed-loop communication.** Safety-critical messages require traceable delivery and acknowledgement states.
6. **No silent correction.** Original values remain available after any authorized amendment.
7. **Privacy by design.** The platform will collect the minimum employee data required for safety and accountability.
8. **Explainability by default.** Dispatch recommendations and alerts must expose the factors used.

## 9. Business requirements

Priorities use MoSCoW classification: Must, Should, Could, and Won't for the initial release.

### 9.1 Identity, access, and qualifications

| ID | Priority | Requirement |
|---|---|---|
| BR-001 | Must | The system shall uniquely identify each user without requiring unnecessary personal information. |
| BR-002 | Must | The system shall restrict capabilities by role, organization, station, and assigned operational scope. |
| BR-003 | Must | The system shall verify that an operator holds the required current qualification before allowing acceptance or completion of a treatment task. |
| BR-004 | Must | Supervisory overrides shall require an authorized role, stated reason, timestamp, and audit entry. |
| BR-005 | Should | The system should support enterprise single sign-on and device-based rapid reauthentication suitable for winter operations. |
| BR-006 | Must | Removed, expired, or suspended access shall be centrally revocable, including on managed field devices. |

### 9.2 Job identification and assignment

| ID | Priority | Requirement |
|---|---|---|
| BR-010 | Must | Each job shall identify the flight, tail/registration, aircraft type, station, gate or pad, and requesting organization. |
| BR-011 | Must | The interface shall prominently present multiple aircraft identifiers to reduce wrong-aircraft selection. |
| BR-012 | Must | A dispatcher shall be able to assign, reassign, pause, cancel, and prioritize jobs subject to role permissions. |
| BR-013 | Must | Assignments and safety-critical changes shall use sent, delivered, read, accepted, rejected, and failed states as applicable. |
| BR-014 | Must | A material assignment change shall require explicit acknowledgement and shall not be represented as accepted before acknowledgement. |
| BR-015 | Should | The system should support barcode, QR, NFC, or vehicle/airport integration to reduce manual selection, subject to operational approval. |
| BR-016 | Must | The system shall detect and warn about duplicate active jobs for the same aircraft. |

### 9.3 Field user experience

| ID | Priority | Requirement |
|---|---|---|
| BR-020 | Must | Primary field workflows shall be operable with large touch targets and minimal typing while wearing approved gloves. |
| BR-021 | Must | The interface shall support high contrast, low-light use, glare, vibration, and precipitation conditions. |
| BR-022 | Must | The product shall not require an operator to interact with the application while the vehicle is moving or while active equipment control requires attention. |
| BR-023 | Must | Safety-critical entries shall use constrained selections and validation rather than unrestricted free text wherever practical. |
| BR-024 | Should | The system should support controlled voice input or physical controls where they can be implemented safely and verified in the operating environment. |
| BR-025 | Must | The interface shall provide clear recovery from an accidental tap without erasing the original audit history. |
| BR-026 | Must | Usability testing shall include representative operators, winter PPE, noise, low light, vibration, and simulated adverse weather. |

### 9.4 Treatment and fluid recording

| ID | Priority | Requirement |
|---|---|---|
| BR-030 | Must | The system shall support the approved one-step and two-step treatment workflows configured for the station and operator. |
| BR-031 | Must | It shall capture fluid type, product where required, mixture/concentration, quantity, applicable temperature information, truck, operator, and relevant aircraft surfaces or treatment scope. |
| BR-032 | Must | It shall record distinct timestamps for treatment start, final deicing/anti-icing-step start, treatment completion, final check, communication, and acknowledgement when applicable. |
| BR-033 | Must | The system shall identify whether each value was imported, measured automatically, entered by a user, calculated, or corrected. |
| BR-034 | Must | Configured rules shall detect incompatible fluid, concentration, temperature, procedure, or aircraft combinations and require resolution before completion. |
| BR-035 | Must | Vehicle telemetry shall not silently replace an operator-confirmed value when the two disagree. The conflict shall be visible and resolved according to approved procedure. |
| BR-036 | Should | The system should reconcile reported usage with truck and storage inventory and flag material differences. |
| BR-037 | Should | The system should capture fluid-recovery or environmental data where available. |

### 9.5 Time, weather, and controlled reference data

| ID | Priority | Requirement |
|---|---|---|
| BR-040 | Must | Operational events shall be stored in UTC and displayed with the applicable airport-local time and timezone. |
| BR-041 | Must | Devices shall monitor clock synchronization and warn when drift exceeds an approved tolerance. |
| BR-042 | Must | Weather data shall display its source, observation location, observation time, receipt time, and freshness. |
| BR-043 | Must | The system shall notify affected users when a material weather input changes during or following a treatment. |
| BR-044 | Must | Automatic weather, qualified human observation, forecast, and manually entered information shall be visibly differentiated. |
| BR-045 | Must | The system shall use a defined conservative fallback when approved weather information is unavailable or stale. |
| BR-046 | Must | HOT, fluid, aircraft, procedure, and decision-rule datasets shall be versioned, approved, integrity-protected, and effective-dated. |
| BR-047 | Must | A completed record shall identify the exact reference-data and software/rule versions used. |
| BR-048 | Must | The system shall prevent or clearly flag use of expired, future-dated, unapproved, or station-inapplicable reference data. |

### 9.6 Final check and communication

| ID | Priority | Requirement |
|---|---|---|
| BR-050 | Must | Only a user qualified and authorized under the applicable procedure may record the final check. |
| BR-051 | Must | The system shall record the final-check result, person, time, method, and any required exceptions. |
| BR-052 | Must | The system shall generate the required post-treatment information from confirmed source data without hiding its component values. |
| BR-053 | Must | The communication record shall identify sender, recipient/channel, content, time, delivery status, acknowledgement status, and any superseding message. |
| BR-054 | Must | The system shall provide an immediately visible approved fallback communication procedure when digital communication is unavailable. |
| BR-055 | Must | In accordance with the applicable approved procedure, verbal communication shall take precedence where required, and the record shall reflect that verbal communication occurred. |
| BR-056 | Must | The application shall not describe an unacknowledged message as successfully communicated. |

### 9.7 Exceptions and operational recovery

| ID | Priority | Requirement |
|---|---|---|
| BR-060 | Must | The system shall provide explicit workflows for pause, abort, equipment failure, low fluid, incorrect fluid, aircraft movement, job cancellation, and safety stop. |
| BR-061 | Must | It shall support partial treatment and controlled handoff between trucks or crews without merging their records ambiguously. |
| BR-062 | Must | It shall support retreatment as a linked but distinct treatment event. |
| BR-063 | Must | It shall record who initiated an exception, when, why, the operational state at that time, and how the exception was resolved. |
| BR-064 | Must | Loss of telemetry, weather, integration, or network service shall be visible and shall trigger the applicable degraded-mode procedure. |
| BR-065 | Should | Supervisors should receive prioritized alerts for unresolved safety and operational exceptions. |

### 9.8 Offline operations and synchronization

| ID | Priority | Requirement |
|---|---|---|
| BR-070 | Must | Core assignment, treatment, final-check, and exception records shall remain usable during a network outage, subject to approved degraded-mode procedures. |
| BR-071 | Must | The user shall always be able to distinguish local, queued, synchronizing, synchronized, conflicted, and rejected data. |
| BR-072 | Must | Synchronization shall be idempotent so replay cannot create duplicate jobs or treatment events. |
| BR-073 | Must | Conflicting changes shall not be silently resolved when they affect safety, identity, timing, fluid, or completion state. |
| BR-074 | Must | Offline records shall retain trusted device, user, event, and sequence provenance. |
| BR-075 | Must | Locally stored operational data shall be encrypted and subject to controlled expiration after confirmed synchronization and applicable retention requirements. |
| BR-076 | Should | The system should provide a local read-only copy of required current procedures and reference data for approved offline use. |

### 9.9 Dispatch and situational awareness

| ID | Priority | Requirement |
|---|---|---|
| BR-080 | Must | Dispatch shall show active requests, job state, aircraft location, assigned resources, acknowledgements, exceptions, and data freshness. |
| BR-081 | Must | Truck status shall include availability, serviceability, fluid state, crew/qualification state, and last update time. |
| BR-082 | Must | Dispatch recommendations shall identify the operational factors and rules used to produce the recommendation. |
| BR-083 | Must | Authorized users may override a recommendation; the override shall include reason, user, and time. |
| BR-084 | Must | The product shall not display an optimization score in a manner that encourages unsafe treatment speed. |
| BR-085 | Should | The system should forecast queue and resource risk while exposing confidence, source data, and limitations. |

### 9.10 Reporting, integration, and audit

| ID | Priority | Requirement |
|---|---|---|
| BR-090 | Must | The system shall expose controlled interfaces for flight, aircraft, station, weather, truck, fluid, treatment, communication, and status data. |
| BR-091 | Must | Integration messages shall use unique identifiers, schema versions, timestamps, source identity, validation, and replay protection. |
| BR-092 | Must | The system shall maintain an append-only audit history for creation, access where required, decisions, state transitions, exports, corrections, and administrative changes. |
| BR-093 | Must | Completed safety-critical events shall not be hard-deleted or overwritten. |
| BR-094 | Must | Corrections shall be new linked events containing original value, corrected value, reason, author, approval where required, and time. |
| BR-095 | Must | An authorized auditor shall be able to export a reproducible evidence package containing inputs, events, acknowledgements, reference-data versions, corrections, and outputs. |
| BR-096 | Should | The platform should support operational, safety, environmental, service-level, fluid, and billing reports from the same authoritative event record. |
| BR-097 | Must | Reports shall state their generation time, source-data cutoff, timezone, filters, and whether unresolved synchronization conflicts exist. |

## 10. Privacy requirements

| ID | Priority | Requirement |
|---|---|---|
| PR-001 | Must | Yuva shall collect only personal data necessary for safety, qualification, accountability, security, or an explicitly approved business purpose. |
| PR-002 | Must | Truck/job tracking shall be preferred over continuous individual tracking. Employee location collection shall stop when the operational need ends. |
| PR-003 | Must | Users shall receive a clear notice describing data collected, purpose, visibility, retention, and rights applicable in the deployment jurisdiction. |
| PR-004 | Must | Safety records shall be logically separated from employee productivity analytics and access shall be independently governed. |
| PR-005 | Must | Yuva shall not make automated disciplinary or employment decisions based solely on operational analytics. |
| PR-006 | Must | Passenger personal data shall not be collected by the deicing workflow. |
| PR-007 | Must | Image capture shall be disabled by default unless a documented purpose, access policy, retention period, and privacy assessment exist. |
| PR-008 | Must | Data retention shall be defined by record category, law, approved program, contract, safety need, and litigation hold rather than indefinite default storage. |
| PR-009 | Must | Production data shall not be used in development or testing unless appropriately minimized and de-identified. |
| PR-010 | Must | A privacy impact assessment shall be completed before deployment and when material tracking or analytics functionality changes. |

## 11. Security and vulnerability requirements

Yuva shall use NIST Cybersecurity Framework 2.0 for governance and lifecycle risk management and OWASP ASVS/MASVS as applicable verification baselines.

| ID | Priority | Requirement |
|---|---|---|
| SR-001 | Must | All access shall be authenticated and authorized on the server; the client interface shall not be treated as an authorization boundary. |
| SR-002 | Must | Administrative and supervisory users shall use phishing-resistant multifactor authentication where supported by the organization's identity provider. |
| SR-003 | Must | Sessions and devices shall be revocable, tokens short-lived, and credentials protected using platform secure storage. |
| SR-004 | Must | Sensitive data shall be encrypted in transit and at rest using approved algorithms and centrally governed key management. |
| SR-005 | Must | Secrets shall not be stored in application source code, mobile packages, logs, or client-accessible configuration. |
| SR-006 | Must | APIs shall validate schemas and business rules, enforce tenant/station boundaries, restrict rates, and prevent replay and duplicate processing. |
| SR-007 | Must | Security-relevant actions and failures shall be logged and monitored without placing credentials or unnecessary personal data in logs. |
| SR-008 | Must | Security logs shall be protected from alteration and correlated with trusted time. |
| SR-009 | Must | The development lifecycle shall include threat modeling, peer review, automated security testing, dependency scanning, secret scanning, and signed release artifacts. |
| SR-010 | Must | Each release shall produce a software bill of materials and use pinned, reviewed dependencies. |
| SR-011 | Must | Critical and high-risk vulnerabilities shall have documented remediation targets, compensating-control procedures, and emergency-release capability. |
| SR-012 | Must | An independent penetration test shall occur before operational launch and after material architectural or trust-boundary changes. |
| SR-013 | Must | Backup, restoration, incident response, key recovery, and degraded-operation procedures shall be documented and tested. |
| SR-014 | Must | Supplier and integration security risks shall be assessed, contractually governed, and monitored. |
| SR-015 | Must | Non-production environments shall be isolated from production and shall not use production credentials. |
| SR-016 | Must | The system shall fail safely: a security, integration, or validation failure shall not be represented as operational approval or completion. |

## 12. Data-integrity requirements

| ID | Priority | Requirement |
|---|---|---|
| DI-001 | Must | Every operational event shall have a globally unique identifier and recorded source. |
| DI-002 | Must | Event provenance shall include user/service identity, device or integration, station, job, aircraft, truck where applicable, timestamp, and sequence. |
| DI-003 | Must | Safety-critical event history shall be append-only and tamper-evident through cryptographic integrity controls. |
| DI-004 | Must | Original values shall remain retrievable after correction, supersession, reconciliation, or migration. |
| DI-005 | Must | The platform shall reject structurally invalid events and quarantine semantically inconsistent integration data for review. |
| DI-006 | Must | Database and message-processing controls shall prevent partial state transitions and duplicate event application. |
| DI-007 | Must | Safety records shall identify the rule, model, configuration, and reference-data versions that produced calculated values or recommendations. |
| DI-008 | Must | Imports and exports shall include completeness and integrity checks and produce reconciliation results. |
| DI-009 | Must | Administrators shall not have an undocumented mechanism to edit completed treatment records directly. |
| DI-010 | Must | Data migrations shall preserve identifiers, lineage, timestamps, corrections, and audit history and shall be independently verified. |

## 13. AI and analytics governance

| ID | Priority | Requirement |
|---|---|---|
| AI-001 | Must | AI outputs shall be labeled as recommendations or estimates and shall not be presented as confirmed operational facts. |
| AI-002 | Must | AI shall not declare an aircraft clean, authorize departure, override approved procedures, or invent missing weather/fluid inputs. |
| AI-003 | Must | Each consequential recommendation shall expose contributing factors, data age, confidence or uncertainty where meaningful, and operational limitations. |
| AI-004 | Must | Authorized humans shall confirm consequential actions, and their decision shall be audited separately from the recommendation. |
| AI-005 | Must | Model version, configuration, inputs, output, time, user-visible explanation, and user action shall be retained for audit. |
| AI-006 | Must | Models shall be evaluated for safety impact, station/aircraft applicability, drift, bias against teams or contractors, and failure under missing or stale data. |
| AI-007 | Must | A rules-based or manual fallback shall be available when an AI service is unavailable or outside its approved operating envelope. |
| AI-008 | Should | Predictive dispatch shall be introduced only after defined data-quality thresholds have been achieved and independently validated. |

## 14. Non-functional requirements

Final numeric targets must be agreed through field testing and operational risk assessment.

| Category | Requirement |
|---|---|
| Availability | The platform shall define storm-mode availability and recovery objectives consistent with safety and business criticality. |
| Performance | Safety-critical screens and acknowledgements shall remain responsive under expected peak storm concurrency and degraded bandwidth. |
| Resilience | Core field workflows shall continue offline and recover without duplicate or silently lost events. |
| Accessibility | Interfaces shall meet applicable accessibility standards without compromising glove-friendly and high-contrast field use. |
| Scalability | The architecture shall support small stations and multi-station enterprise operations with isolated tenants and station configurations. |
| Maintainability | Rules, forms, fluids, aircraft profiles, and reference data shall be version-controlled and changed through governed workflows. |
| Observability | Health, latency, integration lag, stale data, failed messages, conflicts, clock drift, and security anomalies shall be measurable and alertable. |
| Interoperability | APIs and exports shall use documented, versioned formats and stable identifiers. |
| Localization | Station timezone, units, approved terminology, and supported language shall be configurable without changing the authoritative meaning of core fields. |
| Recoverability | Recovery tests shall demonstrate restoration of both current state and complete event/audit history. |

## 15. Key workflows

### 15.1 Standard treatment

1. Flight or authorized user requests treatment.
2. Yuva validates aircraft and flight identity and creates a job.
3. Dispatcher assigns a qualified crew and serviceable truck.
4. Operator acknowledges the assignment and confirms the aircraft.
5. Operator selects or confirms the approved procedure and contamination/weather context.
6. Yuva captures treatment events, timestamps, fluid data, and exceptions.
7. Qualified personnel record the final check.
8. Yuva composes the required post-treatment information from confirmed data.
9. Information is communicated and acknowledged through the approved channel.
10. The job is completed and synchronized into the authoritative audit record.

### 15.2 Loss of connectivity

1. Yuva visibly changes to offline/degraded state.
2. The operator follows the approved fallback communication procedure.
3. Core events are recorded locally with sequence and provenance.
4. The application shows records as queued rather than synchronized.
5. On reconnection, events are replayed idempotently.
6. Conflicts affecting safety data require explicit authorized resolution.
7. The final record preserves both the outage and reconciliation history.

### 15.3 Interrupted treatment and handoff

1. Operator records pause, safety stop, equipment failure, or other interruption.
2. Yuva preserves completed steps and current fluid/timing state.
3. Dispatcher assigns replacement equipment or crew when needed.
4. Receiving operator acknowledges the handoff and confirms the aircraft/job.
5. Subsequent treatment is recorded as linked events with separate provenance.
6. The applicable procedure determines whether treatment continues, restarts, or becomes a distinct retreatment.

## 16. Success measures

Baselines shall be collected before production deployment. Safety metrics must be reviewed together; no single speed or throughput metric may be used in isolation.

| Measure | Intended outcome |
|---|---|
| Duplicate entry per treatment | Material reduction compared with the current process. |
| Mandatory-field completeness | At least the approved operational target, with safety-critical omissions prevented before completion. |
| Timestamp source quality | Increased proportion captured automatically or from trusted synchronized clocks. |
| Communication acknowledgement | Measurable delivery and acknowledgement for all digitally communicated safety-critical messages. |
| Offline record recovery | No lost or duplicated treatment events in approved outage tests. |
| Assignment error rate | Reduction in wrong-aircraft, duplicate-job, and unacknowledged-reassignment events. |
| Record correction rate | Reduction in avoidable corrections; all corrections traceable. |
| Radio workload | Reduction in routine coordination traffic without loss of safety communication. |
| Audit preparation time | Reduction in time needed to assemble a complete treatment evidence package. |
| Operator usability | Successful task completion with representative PPE and environmental simulations. |
| Fluid reconciliation | Improved agreement between reported application, truck telemetry, and inventory. |
| Security posture | No unresolved critical vulnerabilities at release; remediation performance meets policy. |

## 17. MVP release criteria

The MVP shall not enter live safety-sensitive operations until:

- Operational workflows have been validated by representative drivers, sprayers, dispatchers, supervisors, and flight-crew stakeholders.
- A regulatory/compliance review confirms alignment with each deployment's approved program and jurisdiction.
- Safety hazards, mitigations, fallback procedures, and human responsibilities are documented and accepted.
- Offline, reconnect, duplicate-message, clock-drift, stale-weather, and conflict scenarios pass verification.
- Role authorization, tenant/station isolation, audit history, correction controls, encryption, and revocation pass security testing.
- An independent penetration test is complete and release-blocking findings are resolved or formally accepted under governance.
- Backup restoration and incident-response exercises have succeeded.
- Controlled reference datasets are current, approved, signed, and reproducible.
- Training materials and degraded-mode procedures are available to all affected roles.
- Production monitoring and support escalation are operational before the first winter event.

## 18. Phased delivery recommendation

### Phase 0: Discovery and safety definition

- Conduct ride-alongs and contextual interviews at small, large, centralized-pad, and outsourced operations.
- Map current workflows, systems, radio calls, paper records, duplicate entry, and exception paths.
- Establish a safety hazard log, privacy impact assessment, threat model, authoritative-data map, and regulatory matrix.

### Phase 1: Trusted operational record

- Identity, role, qualification, job identification, assignment, treatment capture, final check, communications record, offline operation, and immutable audit history.
- This phase is the MVP.

### Phase 2: Integration and visibility

- Airline/airport flight feeds, weather and sensor inputs, truck telemetry, fluid inventory, dashboards, reports, and billing/environmental exports.

### Phase 3: Explainable decision support

- Queue forecasting, resource-risk warnings, duration estimates, and explainable dispatch recommendations after data-quality validation.

### Phase 4: Multi-station learning

- Governed benchmarking and process improvement using de-identified or appropriately authorized data. No automated employee ranking.

## 19. Discovery and validation plan

The requirements in this document must be validated through direct field research. The recommended minimum is:

- 8–12 drivers and sprayers across single- and two-person trucks.
- 4–6 dispatchers or pad coordinators.
- 3–5 flight-crew or airline winter-operations representatives.
- 3–5 supervisors, trainers, safety, compliance, and environmental representatives.
- At least one small station, one large centralized pad, and one outsourced operation.

Research shall include observation of real or high-fidelity simulated work. Prototype testing shall cover gloves, noise, low light, glare, vibration, connectivity loss, reassignment, equipment failure, incorrect aircraft selection, weather change, and retreatment.

Core interview questions include:

- What information do you enter more than once?
- Which information or system do you distrust, and why?
- When do you return to radio or paper?
- Which mistakes are easiest to make?
- What happens when a normal treatment is interrupted?
- Which alerts help, and which create distraction?
- What information do you wish dispatch or the flight crew already knew?
- How is operational data used to evaluate employees today?

## 20. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Digital workflow increases distraction | No-interaction operating states, minimal input, field usability testing, and hardware/voice options only after safety validation. |
| Stale or incorrect weather drives a bad decision | Source and freshness display, approved sources, change alerts, conservative fallback, and human confirmation. |
| Connectivity failure causes data loss | Offline event log, explicit sync status, idempotent replay, conflict management, and tested recovery. |
| Incorrect aircraft or assignment | Multiple identifiers, proximity/scan assistance, duplicate detection, and closed-loop acknowledgement. |
| Unauthorized or silent record modification | Server authorization, append-only events, tamper evidence, correction workflow, and monitoring. |
| Analytics encourages rushing | Balanced measures, prohibition on unsafe speed incentives, contextual review, and worker involvement in governance. |
| Employee surveillance concerns | Data minimization, purpose limitation, tracking boundaries, notice, retention, access controls, and no solely automated discipline. |
| AI output is treated as authority | Clear labeling, operating envelope, explainability, human confirmation, and rules/manual fallback. |
| Vendor or integration compromise | Supplier assessment, scoped credentials, signed messages where appropriate, monitoring, isolation, and revocation. |
| Reference data is outdated | Signed and effective-dated datasets, approval workflow, update alerts, reproducibility, and blocking of invalid versions. |

## 21. Dependencies

- Executive sponsor and accountable product owner.
- Safety, regulatory, privacy, and security governance.
- Access to frontline personnel and winter operating environments.
- Airline/airport flight and station data.
- Approved weather and, where applicable, LWE/HOT determination sources.
- Truck and fluid telemetry specifications.
- Identity provider and managed-device capabilities.
- Approved fluid, aircraft, station, and procedural reference data.
- Retention, audit, environmental, billing, and contractual policies.
- Integration agreements with airlines, airports, contractors, and flight crews.

## 22. Open decisions

- Which country, regulator, airport, airline, and service-provider context will be the first deployment?
- Will Yuva calculate or only display holdover information in the initial release?
- Which communication channel is approved for flight-crew receipt and acknowledgement?
- Which data source is authoritative for flight, aircraft, gate/pad, weather, and truck telemetry?
- Which vehicle manufacturers and telemetry protocols must be supported first?
- What exact operational records and retention periods apply at the launch station?
- What are the approved degraded-mode and radio fallback procedures?
- Which metrics may be used for workforce management, and under what human-review safeguards?
- What availability, recovery-time, recovery-point, and maximum offline-duration targets are required?
- Which third parties may receive treatment, location, billing, environmental, or analytics data?

## 23. Research basis and references

The requirements are informed by the following public sources. Vendor sources establish current marketed capabilities and industry problem statements; they are not treated as independent proof of product performance. Public operator discussions are anecdotal and require validation through formal user research.

1. FAA, *Ground Deicing and Anti-icing Program*, AC 120-60B: <https://www.faa.gov/airports/resources/advisory_circulars/index.cfm/go/document.information/documentID/23199/>
2. FAA, *Use of Liquid Water Equivalent System to Determine Holdover Times or Check Times for Anti-icing Fluids*, AC 120-112: <https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1027819>
3. FAA, *2025-2026 Holdover Time Guidelines Regression Information*: <https://www.faa.gov/other_visit/aviation_industry/airline_operators/airline_safety/deicing/FAA_2025-26_Regression_Information.pdf>
4. Transport Canada, AC 700-030, *Electronic Holdover Time Applications*: <https://tc.canada.ca/en/aviation/reference-centre/advisory-circulars/advisory-circular-ac-no-700-030>
5. SAE ARP4737H excerpt, aircraft deicing/anti-icing methods and communications: <https://jcaii.com/wp-content/uploads/2020/09/ARP4737H-hilited-for-web.pdf>
6. NASA, *Ground Icing—Anti-Icing Operations and Holdover Time Factors*: <https://aircrafticing.grc.nasa.gov/2_5_2_1.html>
7. Icelink product information: <https://www.tkh-airportsolutions.com/deicing/icelink>
8. AV D-ICE product information: <https://avtura.com/aircraft-deicing-software/>
9. Wiseleap Deicing Manager product information: <https://marketplace.microsoft.com/fr-fr/product/saas/emyode.deicing_manager?tab=overview>
10. NIST, *Cybersecurity Framework 2.0*: <https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20>
11. OWASP, *Mobile Application Security Verification Standard*: <https://mas.owasp.org/MASVS/>

## 24. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Executive sponsor |  |  |  |
| Product owner |  |  |  |
| Winter operations |  |  |  |
| Safety/compliance |  |  |  |
| Security |  |  |  |
| Privacy/legal |  |  |  |
| Engineering |  |  |  |
| Frontline user representative |  |  |  |

