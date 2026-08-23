import unittest
from datetime import datetime, timedelta

from Yuva.Deicing import (
    DecisionSupportEngine,
    DeicingAIEngine,
    DeicingTruck,
    Flight,
    WeatherData,
)


class DecisionSupportTests(unittest.TestCase):
    def setUp(self) -> None:
        self.now = datetime(2026, 1, 15, 8, 0, 0)
        self.weather = WeatherData(-5.0, "snow", 2.0, 12.0)
        self.flights = [
            Flight("YU100", "A320", self.now + timedelta(minutes=30), "A1", 150),
            Flight("YU200", "B777", self.now + timedelta(minutes=60), "A2", 280),
        ]
        engine = DeicingAIEngine()
        for flight in self.flights:
            engine.predict_deicing_need(flight, self.weather)
            engine.estimate_deicing_duration(flight, self.weather)
            engine.calculate_priority_score(flight, self.now)
        self.trucks = [DeicingTruck("T1", "PAD", 80.0)]

    def test_service_estimate_is_advisory_range(self) -> None:
        estimate = DecisionSupportEngine.estimate_service_time(self.flights[0], self.weather)
        self.assertLess(estimate["range_minutes"]["low"], estimate["estimated_minutes"])
        self.assertGreater(estimate["range_minutes"]["high"], estimate["estimated_minutes"])
        self.assertTrue(estimate["requires_human_approval"])
        self.assertEqual(estimate["factors"]["weather_freshness"], "unavailable")

    def test_queue_forecast_does_not_assign_or_mutate_resources(self) -> None:
        forecast = DecisionSupportEngine.forecast_queue(
            self.flights, self.trucks, self.weather, self.now
        )
        self.assertEqual(forecast["queue_length"], 2)
        self.assertTrue(forecast["capacity_warning"])
        self.assertTrue(self.trucks[0].is_available)
        self.assertIsNone(self.trucks[0].assigned_flight_id)
        self.assertTrue(all(f.assigned_truck_id is None for f in self.flights))

    def test_resource_recommendations_require_dispatcher_approval(self) -> None:
        recommendations = DecisionSupportEngine.recommend_resources(
            self.flights, self.trucks, self.weather, self.now
        )
        self.assertTrue(recommendations)
        self.assertTrue(all(item["requires_dispatcher_approval"] for item in recommendations))
        self.assertTrue(all(item["status"] == "advisory" for item in recommendations))

    def test_anomalies_are_explainable_and_require_review(self) -> None:
        bad_truck = DeicingTruck("T2", "PAD", 150.0)
        unknown = Flight("YU300", "UNKNOWN", self.now - timedelta(minutes=10), "A3", 10)
        unknown.deice_required = True
        anomalies = DecisionSupportEngine.detect_anomalies(
            [unknown], [bad_truck], self.weather, self.now
        )
        codes = {item["code"] for item in anomalies}
        self.assertIn("UNKNOWN_AIRCRAFT_TYPE", codes)
        self.assertIn("PAST_DEPARTURE_PENDING_TREATMENT", codes)
        self.assertIn("INVALID_FLUID_LEVEL", codes)
        self.assertTrue(all(item["requires_human_review"] for item in anomalies))
        self.assertIn("WEATHER_FRESHNESS_UNAVAILABLE", codes)


if __name__ == "__main__":
    unittest.main()
