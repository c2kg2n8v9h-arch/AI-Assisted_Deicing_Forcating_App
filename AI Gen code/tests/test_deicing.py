import unittest
from datetime import datetime, timedelta
from pathlib import Path

from Yuva.Deicing import (
    DeicingAIEngine,
    DeicingTruck,
    Flight,
    FlightStatus,
    load_operations_data,
    OptimizationEngine,
    OperationsDashboard,
    WeatherData,
    WeatherSeverity,
)


class DeicingAIEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = DeicingAIEngine()
        self.now = datetime(2026, 8, 20, 23, 0)
        self.flight = Flight(
            "UA124",
            "B777",
            self.now + timedelta(minutes=35),
            "B12",
            260,
        )

    def test_weather_severity_detects_freezing_rain(self):
        weather = WeatherData(-1.0, "freezing_rain", 0.0, 10.0)

        self.assertEqual(weather.severity, WeatherSeverity.FREEZING_RAIN)

    def test_predict_deicing_need_updates_flight(self):
        weather = WeatherData(-3.5, "snow", 2.8, 18.0)

        result = self.engine.predict_deicing_need(self.flight, weather)

        self.assertTrue(result)
        self.assertTrue(self.flight.deice_required)

    def test_estimate_duration_uses_aircraft_size_and_severity(self):
        weather = WeatherData(-3.5, "snow", 2.8, 18.0)

        result = self.engine.estimate_deicing_duration(self.flight, weather)

        self.assertEqual(result, 36.9)
        self.assertEqual(self.flight.estimated_deice_duration_min, 36.9)

    def test_priority_score_is_stored_on_flight(self):
        self.flight.estimated_deice_duration_min = 36.9

        result = self.engine.calculate_priority_score(self.flight, self.now)

        self.assertEqual(result, 87.83)
        self.assertEqual(self.flight.deice_priority_score, 87.83)

    def test_operations_data_file_loads_into_domain_objects(self):
        data_path = Path(__file__).parent.parent / "data" / "operations_data.json"

        weather, flights, trucks = load_operations_data(data_path)

        self.assertEqual(weather.precipitation_type, "snow")
        self.assertEqual(len(flights), 3)
        self.assertEqual(flights[0].flight_id, "UA124")
        self.assertEqual(len(trucks), 2)
        self.assertEqual(trucks[0].truck_id, "TRK-01")


class OptimizationEngineTests(unittest.TestCase):
    def test_dispatch_assigns_available_trucks_by_priority(self):
        now = datetime(2026, 8, 20, 23, 0)
        flights = [
            Flight("LOW", "A320", now + timedelta(minutes=75), "A08", 160),
            Flight("HIGH", "B777", now + timedelta(minutes=35), "B12", 260),
        ]
        flights[0].deice_required = True
        flights[0].deice_priority_score = 40.0
        flights[1].deice_required = True
        flights[1].deice_priority_score = 80.0
        trucks = [DeicingTruck("TRK-01", "A01", 85.0)]

        recommendations = OptimizationEngine.dispatch_trucks(flights, trucks, now)

        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]["flight_id"], "HIGH")
        self.assertEqual(flights[1].status, FlightStatus.QUEUED_FOR_DEICE)
        self.assertFalse(trucks[0].is_available)

    def test_trucks_with_low_fluid_capacity_are_not_dispatched(self):
        now = datetime(2026, 8, 20, 23, 0)
        flight = Flight("UA124", "B777", now, "B12", 260)
        flight.deice_required = True
        flight.deice_priority_score = 80.0
        truck = DeicingTruck("TRK-01", "A01", 19.0)

        recommendations = OptimizationEngine.dispatch_trucks([flight], [truck], now)

        self.assertEqual(recommendations, [])
        self.assertIsNone(flight.assigned_truck_id)


class OperationsDashboardTests(unittest.TestCase):
    def test_alert_is_created_for_unassigned_at_risk_flight(self):
        now = datetime(2026, 8, 20, 23, 0)
        flight = Flight("UA124", "B777", now + timedelta(minutes=20), "B12", 260)
        flight.deice_required = True
        flight.estimated_deice_duration_min = 36.9

        alerts = OperationsDashboard.check_operational_alerts([flight], now)

        self.assertEqual(len(alerts), 1)
        self.assertIn("CRITICAL RISK", alerts[0])


if __name__ == "__main__":
    unittest.main()
