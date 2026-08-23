import unittest

from Yuva.api import (
    build_operations_report,
    health_check,
    load_station_profiles,
    stations_overview,
)
from Yuva.security import ROLE_PERMISSIONS, Role, User


class ApiTests(unittest.TestCase):
    def test_health_endpoint(self):
        self.assertEqual(health_check(), {"status": "ok"})

    def test_operations_endpoint_returns_advisory_report(self):
        payload = build_operations_report()

        self.assertIn("weather", payload)
        self.assertIn("flights", payload)
        self.assertIn("trucks", payload)
        self.assertIn("recommendations", payload)
        self.assertIn("next_flight", payload)
        self.assertEqual(len(payload["flights"]), 8)
        self.assertEqual(len(payload["recommendations"]), 8)
        first_flight = next(
            flight for flight in payload["flights"] if flight["flight_id"] == "MOCK-FLT-001"
        )
        self.assertIsNone(first_flight["assigned_truck_id"])
        self.assertIsNotNone(first_flight["recommended_truck_id"])
        self.assertIn("spray_completion_time", first_flight)
        self.assertIn("minutes_until_departure", first_flight)
        self.assertEqual(payload["decision_support"]["mode"], "advisory")
        self.assertTrue(payload["decision_support"]["requires_human_approval"])

    def test_station_overview_contains_weather_for_all_stations(self):
        viewer = User("test-viewer", Role.VIEWER, ROLE_PERMISSIONS[Role.VIEWER])
        overview = stations_overview(viewer)

        self.assertEqual({station["code"] for station in overview}, {"DEN", "BZN", "ORD", "JFK"})
        self.assertEqual(
            next(item for item in overview if item["code"] == "ORD")["precipitation_type"],
            "freezing_rain",
        )
        jfk = next(item for item in overview if item["code"] == "JFK")
        self.assertEqual(jfk["precipitation_type"], "snow")
        self.assertEqual(jfk["snow_rate_cm_hr"], 6.4)

    def test_supported_stations_have_station_specific_weather(self):
        stations = load_station_profiles()

        self.assertEqual({station["code"] for station in stations}, {"DEN", "BZN", "ORD", "JFK"})
        self.assertNotEqual(
            build_operations_report("DEN")["weather"],
            build_operations_report("ORD")["weather"],
        )
        self.assertEqual(build_operations_report("BZN")["station"]["code"], "BZN")


if __name__ == "__main__":
    unittest.main()
