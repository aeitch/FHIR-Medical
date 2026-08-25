from fastapi import APIRouter, Query
from typing import List, Dict, Any
from backend.app.audit.logger import audit_logger

router = APIRouter(prefix="/audit", tags=["Audit & Governance"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_audit_trail(limit: int = Query(50, ge=1, le=200)):
    """Retrieve immutable append-only audit trail logs."""
    return await audit_logger.get_logs(limit=limit)

@router.get("/finops")
async def get_finops():
    """Retrieve aggregate FinOps token consumption and cost metrics."""
    return await audit_logger.get_finops_summary()
