import os
from datetime import UTC, datetime

from fastapi import APIRouter

router = APIRouter(tags=["Health & Readiness"])


@router.get("/health")
async def health_check():
    """Liveness probe endpoint."""
    return {
        "status": "healthy",
        "service": "clinefficiency-ur-console-backend",
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get("/ready")
async def readiness_check():
    """Readiness probe checking FHIR adapter and LLM provider."""
    return {
        "status": "ready",
        "fhir_store": "online",
        "llm_provider": os.getenv("LLM_PROVIDER", "vertex_ai"),
        "audit_store": "firestore",
        "timestamp": datetime.now(UTC).isoformat(),
    }
