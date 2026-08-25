import os
from typing import Any
from fastapi import APIRouter, HTTPException, Request, Query
from backend.app.audit.logger import audit_logger
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.fhir.epic_adapter import EpicFHIRAdapter
from backend.app.fhir.gcp_healthcare_adapter import GCPHealthcareFHIRAdapter

router = APIRouter(prefix="/patients", tags=["FHIR Patients"])

def get_adapter(provider_override: str | None = None):
    provider = (provider_override or os.getenv("FHIR_PROVIDER", "epic")).lower()
    if provider == "epic":
        return EpicFHIRAdapter()
    elif provider == "gcp_healthcare":
        return GCPHealthcareFHIRAdapter()
    return LocalFixtureFHIRAdapter()

@router.get("", response_model=list[dict[str, Any]])
async def list_patients(
    request: Request,
    provider: str | None = Query(None, description="FHIR provider: 'epic', 'gcp_healthcare', or 'local'"),
):
    """Retrieve all available synthetic demo patients from selected FHIR provider."""
    corr_id = getattr(request.state, "correlation_id", "local")
    adapter = get_adapter(provider)
    patients = await adapter.list_patients()

    await audit_logger.log_event(
        action="FHIR_PATIENTS_LISTED",
        correlation_id=corr_id,
        details={"patient_count": len(patients), "provider": provider or "default"},
    )
    return patients

@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    request: Request,
    provider: str | None = Query(None, description="FHIR provider: 'epic', 'gcp_healthcare', or 'local'"),
):
    """Retrieve full clinical summary for a specific synthetic patient."""
    corr_id = getattr(request.state, "correlation_id", "local")
    adapter = get_adapter(provider)
    summary = await adapter.get_patient_summary(patient_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    await audit_logger.log_event(
        action="FHIR_PATIENT_ACCESSED",
        patient_id=patient_id,
        correlation_id=corr_id,
        details={"provider": provider or "default"},
    )
    return summary
