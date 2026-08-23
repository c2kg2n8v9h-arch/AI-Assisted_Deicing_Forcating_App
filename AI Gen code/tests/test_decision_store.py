import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from Yuva.decision_store import AdvisoryDecisionStore


class AdvisoryDecisionStoreTests(unittest.TestCase):
    def test_records_idempotent_hash_chained_decision(self):
        with TemporaryDirectory() as directory:
            store = AdvisoryDecisionStore(Path(directory) / "decisions.sqlite3")
            first = store.record(
                idempotency_key="request-0001",
                recommendation_id="FLT1:TRUCK1:1",
                station_code="den",
                decision="accepted",
                reason="Reviewed by dispatcher",
                actor="dispatcher1",
            )
            repeated = store.record(
                idempotency_key="request-0001",
                recommendation_id="FLT1:TRUCK1:1",
                station_code="den",
                decision="accepted",
                reason="Reviewed by dispatcher",
                actor="dispatcher1",
            )

            self.assertEqual(first["previous_hash"], "GENESIS")
            self.assertEqual(first["record_hash"], repeated["record_hash"])
            self.assertEqual(first["sequence"], repeated["sequence"])

    def test_rejects_idempotency_key_reuse_with_changed_payload(self):
        with TemporaryDirectory() as directory:
            store = AdvisoryDecisionStore(Path(directory) / "decisions.sqlite3")
            store.record(
                idempotency_key="request-0002",
                recommendation_id="FLT1:TRUCK1:1",
                station_code="DEN",
                decision="accepted",
                reason="Reviewed by dispatcher",
                actor="dispatcher1",
            )
            with self.assertRaises(ValueError):
                store.record(
                    idempotency_key="request-0002",
                    recommendation_id="FLT1:TRUCK1:1",
                    station_code="DEN",
                    decision="rejected",
                    reason="Different decision",
                    actor="dispatcher1",
                )


if __name__ == "__main__":
    unittest.main()
