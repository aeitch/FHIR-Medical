import math
from typing import Any

from backend.app.audit.logger import audit_logger
from backend.app.fhir.registry import FHIR_SERVER_REGISTRY, get_fhir_adapter
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

router = APIRouter(prefix="/patients", tags=["FHIR Patients"])


class PaginatedPatientsResponse(BaseModel):
    items: list[dict[str, Any]]
    page: int
    page_size: int
    total: int
    total_pages: int
    next_page: int | None = None
    server: str


class PatientFetchRequest(BaseModel):
    patient_id: str
    server: str | None = None
    provider: str | None = None


@router.get("", response_model=PaginatedPatientsResponse)
async def list_patients(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    server: str | None = Query(None, description="FHIR server: 'epic', 'smart', 'hapi', 'gcp_healthcare', or 'local'"),
    provider: str | None = Query(None, description="Alias for server"),
):
    """Retrieve paginated patient directory from selected FHIR server."""
    active_server = (server or provider or "epic").lower().strip()
    corr_id = getattr(request.state, "correlation_id", "local")
    adapter = get_fhir_adapter(active_server)

    if hasattr(adapter, "list_patients_paginated"):
        items, total = await adapter.list_patients_paginated(page=page, page_size=page_size)
    else:
        all_items = await adapter.list_patients()
        total = len(all_items)
        start = (page - 1) * page_size
        end = start + page_size
        items = all_items[start:end]

    total_pages = max(1, math.ceil(total / page_size))
    next_page = page + 1 if page < total_pages else None

    await audit_logger.log_event(
        action="FHIR_PATIENTS_LISTED",
        correlation_id=corr_id,
        details={
            "patient_count": len(items),
            "page": page,
            "page_size": page_size,
            "total": total,
            "server": active_server,
        },
    )

    return PaginatedPatientsResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        next_page=next_page,
        server=active_server,
    )


@router.post("/fetch")
@router.get("/fetch")
async def fetch_patient_by_id(
    request: Request,
    payload: PatientFetchRequest | None = None,
    patient_id: str | None = Query(None),
    server: str | None = Query(None),
    provider: str | None = Query(None),
):
    """Dynamically fetch an arbitrary patient chart by ID from the specified FHIR repository."""
    target_id = (payload.patient_id if payload else patient_id) or ""
    target_server = (payload.server or payload.provider if payload else server or provider) or "epic"

    if not target_id.strip():
        raise HTTPException(status_code=400, detail="Patient ID is required")

    corr_id = getattr(request.state, "correlation_id", "local")
    adapter = get_fhir_adapter(target_server)
    summary = await adapter.get_patient_summary(target_id.strip())
    if not summary:
        raise HTTPException(
            status_code=404,
            detail=f"Patient '{target_id}' not found in the {target_server} FHIR repository.",
        )

    await audit_logger.log_event(
        action="FHIR_PATIENT_FETCHED",
        patient_id=target_id,
        correlation_id=corr_id,
        details={"server": target_server, "dynamic_fetch": True},
    )
    return summary


@router.get("/servers")
async def list_fhir_servers():
    """Returns the registry of available FHIR servers and sample patient IDs."""
    return FHIR_SERVER_REGISTRY


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    request: Request,
    server: str | None = Query(None),
    provider: str | None = Query(None),
):
    """Retrieve full clinical summary for a specific synthetic patient."""
    target_server = server or provider or "epic"
    corr_id = getattr(request.state, "correlation_id", "local")
    adapter = get_fhir_adapter(target_server)
    summary = await adapter.get_patient_summary(patient_id)
    if not summary:
        raise HTTPException(
            status_code=404,
            detail=f"Patient '{patient_id}' not found in the configured FHIR source",
        )

    await audit_logger.log_event(
        action="FHIR_PATIENT_ACCESSED",
        patient_id=patient_id,
        correlation_id=corr_id,
        details={"server": target_server},
    )
    return summary


@router.get("/{patient_id}/raw")
async def get_raw_fhir_bundle(
    patient_id: str,
    request: Request,
    server: str | None = Query(None),
    provider: str | None = Query(None),
):
    """Retrieve raw HL7 FHIR R4 JSON bundle for clinical auditor verification."""
    target_server = server or provider or "epic"
    corr_id = getattr(request.state, "correlation_id", "local")
    adapter = get_fhir_adapter(target_server)
    bundle = await adapter.get_raw_bundle(patient_id)
    if not bundle:
        raise HTTPException(
            status_code=404,
            detail=f"Raw FHIR bundle for patient '{patient_id}' not found in {target_server}",
        )

    await audit_logger.log_event(
        action="FHIR_RAW_BUNDLE_INSPECTED",
        patient_id=patient_id,
        correlation_id=corr_id,
        details={"server": target_server},
    )
    return bundle
