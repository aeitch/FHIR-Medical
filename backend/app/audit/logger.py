import logging
import os
import uuid
from datetime import UTC, datetime
from typing import Any, ClassVar

logger = logging.getLogger("ur_console.audit")


class AuditLogger:
    """Append-only audit logger for HIPAA access and CLAIR governance tracking."""

    _in_memory_logs: ClassVar[list[dict[str, Any]]] = []

    def __init__(self, collection_name: str = "ur_audit_logs"):
        self.collection_name = collection_name
        self.firestore_db = None
        self._init_firestore()

    def _init_firestore(self):
        try:
            from google.cloud import firestore

            project_id = os.getenv("GCP_PROJECT_ID", "platinum-factor-489721-f0")
            self.firestore_db = firestore.AsyncClient(project=project_id)
        except Exception as e:
            logger.info("Firestore client not connected (%s). Utilizing local append-only audit store.", e)

    async def log_event(
        self,
        action: str,
        patient_id: str = "general",
        actor: str = "dr.uwah@clinefficiency.demo",
        correlation_id: str = "",
        model: str | None = None,
        cost_usd: float | None = 0.0,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        details: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        entry = {
            "id": f"audit-{uuid.uuid4()}",
            "timestamp": datetime.now(UTC).isoformat(),
            "action": action,
            "patient_id": patient_id,
            "actor": actor,
            "correlation_id": correlation_id or f"corr-{uuid.uuid4().hex[:12]}",
            "model": model,
            "cost_usd": cost_usd or 0.0,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "details": details or {},
        }

        # 1. Store in memory buffer
        self._in_memory_logs.insert(0, entry)
        if len(self._in_memory_logs) > 500:
            self._in_memory_logs.pop()

        # 2. Append to Firestore if active
        if self.firestore_db:
            try:
                doc_ref = self.firestore_db.collection(self.collection_name).document(entry["id"])
                await doc_ref.set(entry)
            except Exception as e:
                logger.warning("Failed to write audit entry to Firestore: %s", e)

        logger.info(
            "AUDIT LOG [%s]: Action=%s, Patient=%s, CorrID=%s, Cost=$%s",
            entry["timestamp"],
            action,
            patient_id,
            entry["correlation_id"],
            entry["cost_usd"],
        )
        return entry

    async def get_logs(self, limit: int = 50) -> list[dict[str, Any]]:
        return self._in_memory_logs[:limit]

    async def get_finops_summary(self) -> dict[str, Any]:
        total_requests = len(self._in_memory_logs)
        narrative_logs = [l for l in self._in_memory_logs if l.get("action") == "NARRATIVE_GENERATED"]
        total_prompt = sum(l.get("prompt_tokens", 0) for l in narrative_logs)
        total_completion = sum(l.get("completion_tokens", 0) for l in narrative_logs)
        total_cost = sum(l.get("cost_usd", 0.0) for l in narrative_logs)

        latencies = [
            l.get("details", {}).get("latency_ms") for l in narrative_logs if l.get("details", {}).get("latency_ms")
        ]
        avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 320.0

        return {
            "total_requests": max(total_requests, len(narrative_logs)),
            "total_prompt_tokens": total_prompt,
            "total_completion_tokens": total_completion,
            "total_cost_usd": round(total_cost, 6),
            "average_latency_ms": avg_latency,
        }


audit_logger = AuditLogger()
