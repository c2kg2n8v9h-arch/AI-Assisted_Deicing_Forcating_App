import unittest

from Yuva.api import build_operations_report, health_check


class ApiTests(unittest.TestCase):
    def test_health_endpoint(self):
        self.assertEqual(health_check(), {"status": "ok"})

    def test_operations_endpoint_returns_dispatch_report(self):
        payload = build_operations_report()

        self.assertIn("weather", payload)
        self.assertIn("flights", payload)
        self.assertIn("trucks", payload)
        self.assertIn("recommendations", payload)
        self.assertEqual(len(payload["flights"]), 8)
        self.assertEqual(len(payload["recommendations"]), 4)
        first_flight = next(
            flight for flight in payload["flights"] if flight["flight_id"] == "MOCK-FLT-001"
        )
        self.assertEqual(first_flight["assigned_truck_id"], "MOCK-TRUCK-01")


if __name__ == "__main__":
    unittest.main()
