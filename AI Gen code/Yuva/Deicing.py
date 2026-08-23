from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import json
from pathlib import Path
from typing import Any, Dict, List, Optional


class WeatherSeverity(Enum):
    CLEAR = 1
    LIGHT_SNOW = 2
    MODERATE_SNOW = 3
    HEAVY_SNOW = 4
    FREEZING_RAIN = 5


class FlightStatus(Enum):
    SCHEDULED = "Scheduled"
    BOARDING = "Boarding"
    QUEUED_FOR_DEICE = "Queued for Deicing"
    DEICING_IN_PROGRESS = "Deicing in Progress"
    DEICED = "Deiced"


@dataclass
class WeatherData:
    temperature_c: float
    precipitation_type: str  # e.g., "snow", "freezing_rain", "none"
    snow_rate_cm_hr: float
    wind_speed_kts: float

    @property
    def severity(self) -> WeatherSeverity:
        if self.precipitation_type == "freezing_rain":
            return WeatherSeverity.FREEZING_RAIN
        if self.snow_rate_cm_hr > 5.0:
            return WeatherSeverity.HEAVY_SNOW
        if self.snow_rate_cm_hr > 1.5:
            return WeatherSeverity.MODERATE_SNOW
        if self.snow_rate_cm_hr > 0.0:
            return WeatherSeverity.LIGHT_SNOW
        return WeatherSeverity.CLEAR


@dataclass
class Flight:
    flight_id: str
    aircraft_type: str
    scheduled_departure: datetime
    gate: str
    passengers_count: int
    status: FlightStatus = FlightStatus.SCHEDULED
    deice_required: bool = False
    estimated_deice_duration_min: float = 0.0
    deice_priority_score: float = 0.0
    assigned_truck_id: Optional[str] = None


@dataclass
class DeicingTruck:
    truck_id: str
    location_gate: str
    fluid_capacity_pct: float
    is_available: bool = True
    assigned_flight_id: Optional[str] = None


class DeicingAIEngine:
    """Predicts weather impact, estimates deicing duration, and scores delay priority."""

    AIRCRAFT_SIZE_MULTIPLIERS = {
        "A320": 1.0,
        "B737": 1.0,
        "A330": 1.5,
        "B777": 1.8,
        "B747": 2.0,
    }

    def predict_deicing_need(self, flight: Flight, weather: WeatherData) -> bool:
        """Determines if aircraft requires deicing based on weather telemetry."""
        needs_deicing = (
            weather.severity != WeatherSeverity.CLEAR
            or weather.temperature_c <= 2.0
        )
        flight.deice_required = needs_deicing
        return needs_deicing

    def estimate_deicing_duration(
        self, flight: Flight, weather: WeatherData
    ) -> float:
        """Predicts deicing completion time based on weather severity and plane scale."""
        base_duration = 10.0  # Base duration in minutes
        size_mult = self.AIRCRAFT_SIZE_MULTIPLIERS.get(
            flight.aircraft_type, 1.0
        )
        severity_mult = weather.severity.value * 0.35

        est_duration = round(base_duration * size_mult * (1 + severity_mult), 1)
        flight.estimated_deice_duration_min = est_duration
        return est_duration

    def calculate_priority_score(
        self, flight: Flight, current_time: datetime
    ) -> float:
        """
        Generates operational risk score (Higher = Urgent Priority).
        Factors: Departure countdown, passenger count, and expected deice duration.
        """
        mins_until_departure = (
            flight.scheduled_departure - current_time
        ).total_seconds() / 60.0

        urgency = max(0.0, (120.0 - mins_until_departure) / 120.0) * 50.0
        passenger_impact = (flight.passengers_count / 300.0) * 25.0
        duration_factor = (flight.estimated_deice_duration_min / 30.0) * 25.0

        score = round(urgency + passenger_impact + duration_factor, 2)
        flight.deice_priority_score = score
        return score


class OptimizationEngine:
    """Matches resources with high-risk flights and provides explainable recovery actions."""

    @staticmethod
    def dispatch_trucks(
        flights: List[Flight],
        trucks: List[DeicingTruck],
        current_time: datetime,
    ) -> List[Dict[str, str]]:
        recommendations = []

        # Filter pending flights needing deicing
        pending = [
            f
            for f in flights
            if f.deice_required
            and f.status
            in (FlightStatus.SCHEDULED, FlightStatus.QUEUED_FOR_DEICE)
        ]
        # Sort by AI priority score descending
        pending.sort(key=lambda x: x.deice_priority_score, reverse=True)

        available_trucks = [
            t for t in trucks if t.is_available and t.fluid_capacity_pct >= 20.0
        ]

        for flight in pending:
            if not available_trucks:
                break

            truck = available_trucks.pop(0)
            truck.is_available = False
            truck.assigned_flight_id = flight.flight_id

            flight.assigned_truck_id = truck.truck_id
            flight.status = FlightStatus.QUEUED_FOR_DEICE

            recommendation = {
                "flight_id": flight.flight_id,
                "truck_id": truck.truck_id,
                "priority_score": str(flight.deice_priority_score),
                "reasoning": (
                    f"Prioritized due to score {flight.deice_priority_score} "
                    f"(Dep: {flight.scheduled_departure.strftime('%H:%M')}, "
                    f"Est duration: {flight.estimated_deice_duration_min}m)."
                ),
            }
            recommendations.append(recommendation)

        return recommendations


class OperationsDashboard:
    """Monitors active operations, flags bottleneck alerts, and produces shift reports."""

    @staticmethod
    def check_operational_alerts(
        flights: List[Flight], current_time: datetime
    ) -> List[str]:
        alerts = []
        for flight in flights:
            if flight.deice_required and not flight.assigned_truck_id:
                mins_left = (
                    flight.scheduled_departure - current_time
                ).total_seconds() / 60.0
                if mins_left < (flight.estimated_deice_duration_min + 15):
                    alerts.append(
                        f"CRITICAL RISK: Flight {flight.flight_id} (Gate {flight.gate}) departure in "
                        f"{int(mins_left)}m exceeds available turnaround buffer without assigned truck."
                    )
        return alerts

    @staticmethod
    def generate_shift_summary(
        flights: List[Flight], trucks: List[DeicingTruck]
    ) -> Dict[str, str]:
        deiced_count = sum(1 for f in flights if f.deice_required)
        active_trucks = sum(1 for t in trucks if not t.is_available)
        avg_duration = (
            sum(
                f.estimated_deice_duration_min
                for f in flights
                if f.deice_required
            )
            / max(1, deiced_count)
        )

        return {
            "Total Monitored Flights": str(len(flights)),
            "Deicing Required Count": str(deiced_count),
            "Equipment Utilization": f"{(active_trucks / max(1, len(trucks))) * 100:.1f}%",
            "Avg Predicted Deice Time": f"{avg_duration:.1f} mins",
        }


class DecisionSupportEngine:
    """Advisory planning only; never confirms cleanliness or departure authority."""

    DISCLAIMER = (
        "Advisory estimate only. Requires review by authorized operations personnel; "
        "it does not declare an aircraft clean, override an approved procedure, "
        "calculate an operationally binding result, or authorize departure."
    )

    @staticmethod
    def estimate_service_time(
        flight: Flight, weather: WeatherData
    ) -> Dict[str, Any]:
        """Return a transparent range instead of presenting a point estimate as fact."""
        aircraft_multiplier = DeicingAIEngine.AIRCRAFT_SIZE_MULTIPLIERS.get(
            flight.aircraft_type
        )
        known_aircraft = aircraft_multiplier is not None
        aircraft_multiplier = aircraft_multiplier or 1.0
        severity_multiplier = 1 + (weather.severity.value * 0.35)
        point_estimate = round(10.0 * aircraft_multiplier * severity_multiplier, 1)

        # Wider bands communicate uncertainty for severe weather and unknown types.
        uncertainty = 0.20 + ((weather.severity.value - 1) * 0.04)
        if not known_aircraft:
            uncertainty += 0.15
        low = round(max(1.0, point_estimate * (1 - uncertainty)), 1)
        high = round(point_estimate * (1 + uncertainty), 1)
        confidence = "medium" if known_aircraft else "low"
        if weather.severity in (
            WeatherSeverity.HEAVY_SNOW,
            WeatherSeverity.FREEZING_RAIN,
        ):
            confidence = "low"

        return {
            "flight_id": flight.flight_id,
            "estimated_minutes": point_estimate,
            "range_minutes": {"low": low, "high": high},
            "confidence": confidence,
            "factors": {
                "aircraft_type": flight.aircraft_type,
                "aircraft_type_known": known_aircraft,
                "weather_severity": weather.severity.name,
                "snow_rate_cm_hr": weather.snow_rate_cm_hr,
                "wind_speed_kts": weather.wind_speed_kts,
                "weather_observation_time": None,
                "weather_freshness": "unavailable",
            },
            "requires_human_approval": True,
            "disclaimer": DecisionSupportEngine.DISCLAIMER,
        }

    @staticmethod
    def forecast_queue(
        flights: List[Flight],
        trucks: List[DeicingTruck],
        weather: WeatherData,
        current_time: datetime,
    ) -> Dict[str, Any]:
        """Forecast queue wait/completion with deterministic list scheduling."""
        eligible_trucks = [
            truck
            for truck in trucks
            if truck.is_available and truck.fluid_capacity_pct >= 20.0
        ]
        pending = [
            flight
            for flight in flights
            if flight.deice_required
            and flight.status
            in (FlightStatus.SCHEDULED, FlightStatus.QUEUED_FOR_DEICE)
        ]
        pending.sort(
            key=lambda flight: (
                -flight.deice_priority_score,
                flight.scheduled_departure,
                flight.flight_id,
            )
        )

        if not eligible_trucks:
            return {
                "queue_length": len(pending),
                "eligible_truck_count": 0,
                "estimated_clear_time": None,
                "flights": [],
                "capacity_warning": bool(pending),
                "requires_human_approval": True,
                "disclaimer": DecisionSupportEngine.DISCLAIMER,
            }

        next_available = {
            truck.truck_id: current_time for truck in eligible_trucks
        }
        forecast = []
        for position, flight in enumerate(pending, start=1):
            truck_id = min(
                next_available,
                key=lambda candidate: (next_available[candidate], candidate),
            )
            start_time = next_available[truck_id]
            estimate = DecisionSupportEngine.estimate_service_time(flight, weather)
            completion_time = start_time + timedelta(
                minutes=estimate["estimated_minutes"]
            )
            next_available[truck_id] = completion_time
            wait_minutes = max(
                0.0, (start_time - current_time).total_seconds() / 60.0
            )
            departure_margin = (
                flight.scheduled_departure - completion_time
            ).total_seconds() / 60.0
            forecast.append(
                {
                    "queue_position": position,
                    "flight_id": flight.flight_id,
                    "candidate_truck_id": truck_id,
                    "estimated_start": start_time.isoformat(),
                    "estimated_completion": completion_time.isoformat(),
                    "estimated_wait_minutes": round(wait_minutes, 1),
                    "estimated_departure_margin_minutes": round(departure_margin, 1),
                    "service_time": estimate,
                }
            )

        clear_time = max(next_available.values()) if forecast else current_time
        return {
            "queue_length": len(pending),
            "eligible_truck_count": len(eligible_trucks),
            "estimated_clear_time": clear_time.isoformat(),
            "flights": forecast,
            "capacity_warning": len(pending) > len(eligible_trucks),
            "input_quality": {
                "weather_freshness": "unavailable",
                "warning": "Weather observation time is not present in the input model.",
            },
            "requires_human_approval": True,
            "disclaimer": DecisionSupportEngine.DISCLAIMER,
        }

    @staticmethod
    def detect_anomalies(
        flights: List[Flight],
        trucks: List[DeicingTruck],
        weather: WeatherData,
        current_time: datetime,
    ) -> List[Dict[str, Any]]:
        """Detect explainable data and capacity anomalies without changing state."""
        anomalies: List[Dict[str, Any]] = []
        seen_flights = set()
        for flight in flights:
            if flight.flight_id in seen_flights:
                anomalies.append(
                    {
                        "code": "DUPLICATE_FLIGHT_ID",
                        "severity": "high",
                        "entity_id": flight.flight_id,
                        "message": "Duplicate flight identifier in the active dataset.",
                    }
                )
            seen_flights.add(flight.flight_id)
            if flight.passengers_count < 0:
                anomalies.append(
                    {
                        "code": "INVALID_PASSENGER_COUNT",
                        "severity": "medium",
                        "entity_id": flight.flight_id,
                        "message": "Passenger count is negative and requires correction.",
                    }
                )
            if flight.aircraft_type not in DeicingAIEngine.AIRCRAFT_SIZE_MULTIPLIERS:
                anomalies.append(
                    {
                        "code": "UNKNOWN_AIRCRAFT_TYPE",
                        "severity": "medium",
                        "entity_id": flight.flight_id,
                        "message": "No validated service-time profile exists for this aircraft type.",
                    }
                )
            if (
                flight.deice_required
                and flight.scheduled_departure < current_time
                and flight.status not in (FlightStatus.DEICED,)
            ):
                anomalies.append(
                    {
                        "code": "PAST_DEPARTURE_PENDING_TREATMENT",
                        "severity": "high",
                        "entity_id": flight.flight_id,
                        "message": "Flight is past scheduled departure and remains pending treatment.",
                    }
                )

        seen_trucks = set()
        for truck in trucks:
            if truck.truck_id in seen_trucks:
                anomalies.append(
                    {
                        "code": "DUPLICATE_TRUCK_ID",
                        "severity": "high",
                        "entity_id": truck.truck_id,
                        "message": "Duplicate truck identifier in the active dataset.",
                    }
                )
            seen_trucks.add(truck.truck_id)
            if not 0.0 <= truck.fluid_capacity_pct <= 100.0:
                anomalies.append(
                    {
                        "code": "INVALID_FLUID_LEVEL",
                        "severity": "high",
                        "entity_id": truck.truck_id,
                        "message": "Truck fluid level is outside the valid 0-100 percent range.",
                    }
                )
            elif truck.fluid_capacity_pct < 20.0:
                anomalies.append(
                    {
                        "code": "LOW_FLUID_CAPACITY",
                        "severity": "medium",
                        "entity_id": truck.truck_id,
                        "message": "Truck is below the advisory dispatch fluid threshold.",
                    }
                )

        pending_count = sum(
            1
            for flight in flights
            if flight.deice_required
            and flight.status
            in (FlightStatus.SCHEDULED, FlightStatus.QUEUED_FOR_DEICE)
        )
        eligible_count = sum(
            1
            for truck in trucks
            if truck.is_available and truck.fluid_capacity_pct >= 20.0
        )
        if pending_count and not eligible_count:
            anomalies.append(
                {
                    "code": "NO_ELIGIBLE_TRUCK_CAPACITY",
                    "severity": "critical",
                    "entity_id": "fleet",
                    "message": "Flights require treatment but no available truck meets the advisory fluid threshold.",
                }
            )
        if weather.wind_speed_kts < 0 or weather.snow_rate_cm_hr < 0:
            anomalies.append(
                {
                    "code": "INVALID_WEATHER_VALUE",
                    "severity": "high",
                    "entity_id": "weather",
                    "message": "A weather measurement is negative and requires source validation.",
                }
            )
        anomalies.append(
            {
                "code": "WEATHER_FRESHNESS_UNAVAILABLE",
                "severity": "medium",
                "entity_id": "weather",
                "message": "Weather observation time is absent; freshness must be verified before operational use.",
            }
        )

        for anomaly in anomalies:
            anomaly["detected_at"] = current_time.isoformat()
            anomaly["requires_human_review"] = True
            anomaly["disclaimer"] = DecisionSupportEngine.DISCLAIMER
        return anomalies

    @staticmethod
    def recommend_resources(
        flights: List[Flight],
        trucks: List[DeicingTruck],
        weather: WeatherData,
        current_time: datetime,
    ) -> List[Dict[str, Any]]:
        """Return non-mutating candidate assignments for dispatcher approval."""
        queue = DecisionSupportEngine.forecast_queue(
            flights, trucks, weather, current_time
        )
        recommendations = []
        for item in queue["flights"]:
            flight = next(
                candidate
                for candidate in flights
                if candidate.flight_id == item["flight_id"]
            )
            reasons = [
                f"Priority score {flight.deice_priority_score}",
                f"Estimated wait {item['estimated_wait_minutes']} minutes",
                f"Estimated departure margin {item['estimated_departure_margin_minutes']} minutes",
            ]
            recommendations.append(
                {
                    "recommendation_id": (
                        f"{flight.flight_id}:{item['candidate_truck_id']}:{item['queue_position']}"
                    ),
                    "flight_id": flight.flight_id,
                    "candidate_truck_id": item["candidate_truck_id"],
                    "queue_position": item["queue_position"],
                    "reasons": reasons,
                    "requires_dispatcher_approval": True,
                    "status": "advisory",
                    "disclaimer": DecisionSupportEngine.DISCLAIMER,
                }
            )
        return recommendations


def load_operations_data(data_path: Path) -> tuple[WeatherData, List[Flight], List[DeicingTruck]]:
    """Load weather, flight, and truck input data from a JSON file."""
    with data_path.open(encoding="utf-8") as data_file:
        data = json.load(data_file)

    weather_data = WeatherData(**data["weather"])
    flights = [
        Flight(
            flight_id=flight["flight_id"],
            aircraft_type=flight["aircraft_type"],
            scheduled_departure=datetime.fromisoformat(
                flight["scheduled_departure"]
            ),
            gate=flight["gate"],
            passengers_count=flight["passengers_count"],
        )
        for flight in data["flights"]
    ]
    trucks = [DeicingTruck(**truck) for truck in data["trucks"]]
    return weather_data, flights, trucks


# ==========================================
# Execution & Verification Workflow
# ==========================================
if __name__ == "__main__":
    now = datetime.now()
    project_root = Path(__file__).resolve().parent.parent

    # 1. Weather Data Feed
    weather, flights, trucks = load_operations_data(
        project_root / "data" / "operations_data.json"
    )

    # 3. AI Prediction Pipeline
    ai_engine = DeicingAIEngine()
    for f in flights:
        if ai_engine.predict_deicing_need(f, weather):
            ai_engine.estimate_deicing_duration(f, weather)
            ai_engine.calculate_priority_score(f, now)

    # 4. Optimization & Recommendation Dispatch
    dispatch_plan = OptimizationEngine.dispatch_trucks(flights, trucks, now)

    # 5. Dashboard Output & Alerts
    alerts = OperationsDashboard.check_operational_alerts(flights, now)
    summary = OperationsDashboard.generate_shift_summary(flights, trucks)

    # Display Results
    print("--- AI DISPATCH RECOMMENDATIONS ---")
    for plan in dispatch_plan:
        print(f"[{plan['flight_id']}] -> Assigned {plan['truck_id']}")
        print(f"  Reasoning: {plan['reasoning']}")

    print("\n--- OPERATIONAL ALERTS ---")
    for alert in alerts:
        print(alert)

    print("\n--- SHIFT SUMMARY KPI REPORT ---")
    for k, v in summary.items():
        print(f"{k}: {v}")
