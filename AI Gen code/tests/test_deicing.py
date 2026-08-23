import unittest
from datetime import datetime, timedelta
from pathlib import Path

from Yuva.Deicing import (
    DeicingAIEngine,
    Flight,
    OperationsDashboard,
    WeatherData,
    WeatherSeverity,
    load_operations_data,
)


class DeicingAIEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = DeicingAIEngine()
        self.now = datetime(2026, 8, 20, 23, 0)
        self.flight = Flight(
            "MOCK-FLT-001",
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

        self.assertEqual(result, 30.6)
        self.assertEqual(self.flight.estimated_deice_duration_min, 30.6)

    def test_priority_score_is_stored_on_flight(self):
        self.flight.estimated_deice_duration_min = 30.6

        result = self.engine.calculate_priority_score(self.flight, self.now)

        self.assertEqual(result, 82.58)
        self.assertEqual(self.flight.deice_priority_score, 82.58)

    def test_operations_data_file_loads_into_domain_objects(self):
        data_path = Path(__file__).parent.parent / "data" / "operations_data.json"

        weather, flights, trucks = load_operations_data(data_path)

        self.assertEqual(weather.precipitation_type, "snow")
        self.assertEqual(len(flights), 8)
        self.assertEqual(flights[0].flight_id, "MOCK-FLT-001")
        self.assertEqual(len(trucks), 5)
        self.assertEqual(trucks[0].truck_id, "MOCK-TRUCK-01")


class OperationsDashboardTests(unittest.TestCase):
    def test_alert_is_created_for_unassigned_at_risk_flight(self):
        now = datetime(2026, 8, 20, 23, 0)
        flight = Flight("MOCK-FLT-001", "B777", now + timedelta(minutes=20), "B12", 260)
        flight.deice_required = True
        flight.estimated_deice_duration_min = 36.9

        alerts = OperationsDashboard.check_operational_alerts([flight], now)

        self.assertEqual(len(alerts), 1)
        self.assertIn("CRITICAL RISK", alerts[0])


if __name__ == "__main__":
    unittest.main()
