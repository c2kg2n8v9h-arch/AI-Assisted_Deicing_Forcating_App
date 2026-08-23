"""Append-only persistence for human decisions on advisory recommendations."""

from __future__ import annotations

import hashlib
import json
import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path
from threading import Lock
from typing import Any


class AdvisoryDecisionStore:
    """Store decisions idempotently with a tamper-evident hash chain."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with closing(self._connect()) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS advisory_decisions (
                    sequence INTEGER PRIMARY KEY AUTOINCREMENT,
                    idempotency_key TEXT NOT NULL UNIQUE,
                    request_hash TEXT NOT NULL,
                    recommendation_id TEXT NOT NULL,
                    station_code TEXT NOT NULL,
                    decision TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    previous_hash TEXT NOT NULL,
                    record_hash TEXT NOT NULL UNIQUE
                )
                """
            )

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, timeout=5)
        connection.row_factory = sqlite3.Row
        return connection

    @staticmethod
    def _digest(payload: dict[str, Any]) -> str:
        canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def record(
        self,
        *,
        idempotency_key: str,
        recommendation_id: str,
        station_code: str,
        decision: str,
        reason: str,
        actor: str,
    ) -> dict[str, Any]:
        request = {
            "recommendation_id": recommendation_id,
            "station_code": station_code.upper(),
            "decision": decision,
            "reason": reason,
            "actor": actor,
        }
        request_hash = self._digest(request)
        with self._lock, closing(self._connect()) as connection:
            existing = connection.execute(
                "SELECT * FROM advisory_decisions WHERE idempotency_key = ?",
                (idempotency_key,),
            ).fetchone()
            if existing is not None:
                if existing["request_hash"] != request_hash:
                    raise ValueError("Idempotency key was already used for another decision")
                return dict(existing)

            previous = connection.execute(
                "SELECT record_hash FROM advisory_decisions ORDER BY sequence DESC LIMIT 1"
            ).fetchone()
            previous_hash = previous["record_hash"] if previous else "GENESIS"
            created_at = datetime.now(UTC).isoformat()
            record = {
                **request,
                "idempotency_key": idempotency_key,
                "request_hash": request_hash,
                "created_at": created_at,
                "previous_hash": previous_hash,
            }
            record_hash = self._digest(record)
            cursor = connection.execute(
                """
                INSERT INTO advisory_decisions (
                    idempotency_key, request_hash, recommendation_id,
                    station_code, decision, reason, actor, created_at,
                    previous_hash, record_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    idempotency_key,
                    request_hash,
                    recommendation_id,
                    request["station_code"],
                    decision,
                    reason,
                    actor,
                    created_at,
                    previous_hash,
                    record_hash,
                ),
            )
            connection.commit()
            return {
                "sequence": cursor.lastrowid,
                **record,
                "record_hash": record_hash,
            }
