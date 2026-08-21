from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .Deicing import (
    DeicingAIEngine,
    FlightStatus,
    OptimizationEngine,
    OperationsDashboard,
    load_operations_data,
)


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "operations_data.json"
FRONTEND_PATH = PROJECT_ROOT / "frontend"

app = FastAPI(
    title="Airport Deicing Operations API",
    version="0.1.0",
    description="Dispatch and operations API for airport deicing decisions.",
)


def build_operations_report() -> dict[str, Any]:
    """Run the deicing pipeline and return a JSON-serializable report."""
    current_time = datetime.now()
    weather, flights, trucks = load_operations_data(DATA_PATH)
    ai_engine = DeicingAIEngine()

    for flight in flights:
        if ai_engine.predict_deicing_need(flight, weather):
            ai_engine.estimate_deicing_duration(flight, weather)
            ai_engine.calculate_priority_score(flight, current_time)

    recommendations = OptimizationEngine.dispatch_trucks(
        flights, trucks, current_time
    )
    alerts = OperationsDashboard.check_operational_alerts(flights, current_time)
    summary = OperationsDashboard.generate_shift_summary(flights, trucks)

    return {
        "generated_at": current_time.isoformat(),
        "weather": {
            "temperature_c": weather.temperature_c,
            "precipitation_type": weather.precipitation_type,
            "snow_rate_cm_hr": weather.snow_rate_cm_hr,
            "wind_speed_kts": weather.wind_speed_kts,
            "severity": weather.severity.name,
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
        "alerts": alerts,
        "summary": summary,
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/operations")
def operations() -> dict[str, Any]:
    return build_operations_report()


app.mount("/", StaticFiles(directory=FRONTEND_PATH, html=True), name="frontend")
