from datetime import datetime, timedelta
import json
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles

from .Deicing import (
    DecisionSupportEngine,
    DeicingAIEngine,
    OptimizationEngine,
    OperationsDashboard,
    WeatherData,
    load_operations_data,
)
from .security import Role, User, auth_enabled, require_roles


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "operations_data.json"
STATIONS_PATH = PROJECT_ROOT / "data" / "stations.json"
FRONTEND_PATH = PROJECT_ROOT / "frontend"
load_dotenv(PROJECT_ROOT / ".env")

app = FastAPI(
    title="Airport Deicing Operations API",
    version="0.1.0",
    description="Dispatch and operations API for airport deicing decisions.",
)


def load_station_profiles() -> list[dict[str, Any]]:
    with STATIONS_PATH.open(encoding="utf-8") as data_file:
        return json.load(data_file)["stations"]


def get_station_profile(station_code: str) -> dict[str, Any]:
    station_code = station_code.upper()
    station = next(
        (item for item in load_station_profiles() if item["code"] == station_code),
        None,
    )
    if station is None:
        raise HTTPException(status_code=404, detail="Unsupported station")
    return station


def build_operations_report(station_code: str = "DEN") -> dict[str, Any]:
    """Run the deicing pipeline and return a JSON-serializable report."""
    current_time = datetime.now()
    station = get_station_profile(station_code)
    _, flights, trucks = load_operations_data(DATA_PATH)
    weather = WeatherData(**station["weather"])
    ai_engine = DeicingAIEngine()

    flight_timing = {}
    for flight in flights:
        if ai_engine.predict_deicing_need(flight, weather):
            ai_engine.estimate_deicing_duration(flight, weather)
            ai_engine.calculate_priority_score(flight, current_time)

    # Read reports provide recommendations only and never mutate assignments.
    recommendations = DecisionSupportEngine.recommend_resources(
        flights, trucks, weather, current_time
    )
    queue_forecast = DecisionSupportEngine.forecast_queue(
        flights, trucks, weather, current_time
    )
    anomalies = DecisionSupportEngine.detect_anomalies(
        flights, trucks, weather, current_time
    )
    alerts = OperationsDashboard.check_operational_alerts(flights, current_time)
    summary = OperationsDashboard.generate_shift_summary(flights, trucks)
    for flight in flights:
        completion_time = current_time + timedelta(
            minutes=flight.estimated_deice_duration_min
        )
        minutes_until_departure = round(
            (flight.scheduled_departure - current_time).total_seconds() / 60
        )
        timing = {
            "spray_completion_time": completion_time.isoformat(),
            "minutes_until_departure": minutes_until_departure,
            "departure_status": "scheduled" if minutes_until_departure >= 0 else "departed",
        }
        flight_timing[flight.flight_id] = timing

    future_flights = [
        flight for flight in flights if flight.scheduled_departure >= current_time
    ]
    next_flight = min(
        future_flights or flights,
        key=lambda flight: flight.scheduled_departure,
    )

    return {
        "generated_at": current_time.isoformat(),
        "station": {
            "code": station["code"],
            "name": station["name"],
            "timezone": station["timezone"],
            "deicing_pads": station["deicing_pads"],
            "crew_count": station["crew_count"],
            "runway_count": station["runway_count"],
        },
        "weather": {
            "temperature_c": weather.temperature_c,
            "precipitation_type": weather.precipitation_type,
            "snow_rate_cm_hr": weather.snow_rate_cm_hr,
            "wind_speed_kts": weather.wind_speed_kts,
            "severity": weather.severity.name,
        },
        "next_flight": {
            "flight_id": next_flight.flight_id,
            "scheduled_departure": next_flight.scheduled_departure.isoformat(),
            "minutes_until_departure": flight_timing[next_flight.flight_id]["minutes_until_departure"],
            "departure_status": flight_timing[next_flight.flight_id]["departure_status"],
        },
        "flights": [
            {
                "flight_id": flight.flight_id,
                "aircraft_type": flight.aircraft_type,
                "scheduled_departure": flight.scheduled_departure.isoformat(),
                "gate": flight.gate,
                "passengers_count": flight.passengers_count,
                "status": flight.status.value,
                "deice_required": flight.deice_required,
                "estimated_deice_duration_min": flight.estimated_deice_duration_min,
                "deice_priority_score": flight.deice_priority_score,
                "assigned_truck_id": flight.assigned_truck_id,
                "spray_completion_time": flight_timing[flight.flight_id]["spray_completion_time"],
                "minutes_until_departure": flight_timing[flight.flight_id]["minutes_until_departure"],
                "departure_status": flight_timing[flight.flight_id]["departure_status"],
            }
            for flight in flights
        ],
        "trucks": [
            {
                "truck_id": truck.truck_id,
                "location_gate": truck.location_gate,
                "fluid_capacity_pct": truck.fluid_capacity_pct,
                "is_available": truck.is_available,
                "assigned_flight_id": truck.assigned_flight_id,
            }
            for truck in trucks
        ],
        "recommendations": recommendations,
        "decision_support": {
            "mode": "advisory",
            "requires_human_approval": True,
            "queue_forecast": queue_forecast,
            "anomalies": anomalies,
            "limitations": DecisionSupportEngine.DISCLAIMER,
        },
        "alerts": alerts,
        "summary": summary,
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/operations")
def operations(
    station: str = Query("DEN", min_length=3, max_length=3),
    _user: User = Depends(
        require_roles(Role.VIEWER, Role.DISPATCHER, Role.ADMIN)
    ),
) -> dict[str, Any]:
    return build_operations_report(station)


@app.post("/operations/dispatch")
def dispatch_operations(
    station: str = Query("DEN", min_length=3, max_length=3),
    _user: User = Depends(require_roles(Role.DISPATCHER, Role.ADMIN)),
) -> dict[str, Any]:
    # This endpoint currently returns an advisory plan. A future state-changing
    # dispatch action must require explicit recommendation approval and audit it.
    return build_operations_report(station)


@app.get("/stations")
def stations(
    _user: User = Depends(
        require_roles(Role.VIEWER, Role.DISPATCHER, Role.ADMIN)
    ),
) -> list[dict[str, Any]]:
    return [
        {key: station[key] for key in ("code", "name", "timezone")}
        for station in load_station_profiles()
    ]


@app.get("/stations/overview")
def stations_overview(
    _user: User = Depends(
        require_roles(Role.VIEWER, Role.DISPATCHER, Role.ADMIN)
    ),
) -> list[dict[str, Any]]:
    overview = []
    for station in load_station_profiles():
        weather = WeatherData(**station["weather"])
        overview.append(
            {
                "code": station["code"],
                "name": station["name"],
                "temperature_c": weather.temperature_c,
                "precipitation_type": weather.precipitation_type,
                "snow_rate_cm_hr": weather.snow_rate_cm_hr,
                "wind_speed_kts": weather.wind_speed_kts,
                "severity": weather.severity.name,
            }
        )
    return overview


@app.get("/users/me")
def current_user(
    user: User = Depends(
        require_roles(Role.VIEWER, Role.DISPATCHER, Role.ADMIN)
    ),
) -> dict[str, Any]:
    return {
        "username": user.username,
        "role": user.role.value,
        "permissions": sorted(user.permissions),
        "authentication_enabled": auth_enabled(),
    }


app.mount("/", StaticFiles(directory=FRONTEND_PATH, html=True), name="frontend")
