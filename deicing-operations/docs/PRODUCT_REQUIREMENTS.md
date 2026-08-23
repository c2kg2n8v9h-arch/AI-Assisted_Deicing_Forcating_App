# AI-Powered Deicing Operations Assistant

## 1. Problem Statement

**Prototype boundary:** Release 1 is a mock-data demonstration only. It must not connect to live weather, airline, airport, GPS, telematics, or external operational systems.

Winter weather operations can cause deicing delays, inefficient resource allocation, unnecessary fluid usage, repeat deicing procedures, and delayed departures. Supervisors coordinate aircraft, crews, vehicles, weather conditions, fluid selection, holdover time, and turnaround constraints across multiple communication channels.

Rapidly changing weather and flight delays can invalidate earlier decisions. The assistant centralizes these signals and provides explainable recommendations so supervisors can identify risks early and coordinate recovery actions.

## 2. Business Goal

Continuously monitor weather and airport operational data to:

- Predict deicing demand.
- Identify aircraft requiring deicing or anti-icing.
- Recommend fluid Type I, II, III, or IV using approved operational guidance.
- Calculate applicable holdover time (HOT).
- Recommend when deicing should begin.
- Prioritize aircraft using safety, holdover, departure, and operational impact.
- Identify turnaround bottlenecks and delays.
- Recommend recovery actions that improve safety and resource utilization.

The initial MVP release will support deicing operations at Denver International Airport (DEN), Bozeman Yellowstone International Airport (BZN), Chicago O'Hare International Airport (ORD), and New York John F. Kennedy International Airport (JFK). Supervisors will be able to select a station and receive station-specific weather, operational data, recommendations, and resource information.

## 3. Primary User Story

As a ramp supervisor, I want the assistant to monitor weather, precipitation, accumulation, aircraft, departure, turnaround, delay, and holdover information so that I can make safe and timely deicing decisions, allocate trucks and crews, and protect on-time departures.

## 4. MVP Scope

### Supported Stations

- Denver International Airport (DEN)
- Bozeman Yellowstone International Airport (BZN)
- Chicago O'Hare International Airport (ORD)
- New York John F. Kennedy International Airport (JFK)

### Future Releases

- Additional airline stations.
- Multi-station monitoring.
- Enterprise-wide winter operations dashboard.

## 5. Functional Requirements

The system shall:

- Integrate weather and airport operational data.
- Allow users to select a supported station.
- Load station-specific weather, aircraft schedules, deicing resources, holdover tables, and operational dashboards for the selected station.
- Tailor recommendations to station-specific weather, airport configuration, deicing pads, available trucks, available crews, flight schedules, approved holdover guidance, and historical operational data.
- Support adding stations in future releases without requiring application redesign.
- Monitor snow, freezing rain, sleet, frost, precipitation intensity, and accumulation.
- Identify aircraft requiring deicing or anti-icing.
- Recommend an appropriate fluid type based on aircraft and weather inputs.
- Calculate holdover time from fluid, weather, and precipitation conditions.
- Recommend an optimal deicing start window relative to departure.
- Re-evaluate decisions when weather or operational delays change.
- Predict turnaround delay risk.
- Prioritize aircraft using departure time, holdover expiry, operational impact, and resources.
- Track trucks, equipment, and crews.
- Recommend truck and crew assignments.
- Alert supervisors when holdover expiry or repeat deicing is likely.
- Generate explainable recovery recommendations.
- Provide a dashboard with aircraft status, fluid recommendations, holdover timers, resource availability, and operational risks.

## 6. Current Implementation Coverage

### Implemented

- Weather severity classification for snow and freezing rain.
- Deicing-need prediction.
- Aircraft-size duration estimates.
- Flight priority scoring.
- Deicing truck assignment and fluid-capacity filtering.
- Operational alerts and KPI summary.
- FastAPI `/operations`, `/operations/recommendations`, and advisory decision endpoints.
- Viewer, dispatcher, and admin API roles.
- Dashboard with weather, flight, truck, KPI, and alert views.
- Mock operational data and Playwright browser tests.
- Station selection and station-specific operational data are planned; the current dashboard uses one mock station dataset.

### Next Implementation Slices

1. Add station entities, station selection, and station-scoped authorization.
2. Add station-specific mock datasets for DEN, BZN, ORD, and JFK.
3. Add precipitation accumulation and frost/sleet fields to the data model.
4. Add fluid type recommendations with explainable rules and approved reference tables.
5. Add holdover-time calculation with source/version metadata and expiry countdowns.
6. Add turnaround and delay inputs with repeat-deicing risk alerts.
7. Add crew resources and crew assignment recommendations.
8. Add persisted operational history and audit logs.
9. Connect approved weather and airport operations feeds.

## 7. Safety and Governance Constraints

- The assistant provides decision support; the ramp supervisor remains accountable for the operational decision.
- Fluid and holdover recommendations must be validated against current approved regulatory and operator guidance before production use.
- Every recommendation should expose its inputs, rule/version, timestamp, and reason.
- Production integrations must distinguish mock data from live operational data.
- Authentication, authorization, audit logging, data retention, and incident review are required before production deployment.
