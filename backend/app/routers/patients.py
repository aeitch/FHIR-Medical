from typing import Any

from backend.app.audit.logger import audit_logger
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/patients", tags=["FHIR Patients"])
fhir_adapter = LocalFixtureFHIRAdapter()


@router.get("", response_model=list[dict[str, Any]])
async def list_patients(request: Request):
    """Retrieve all available synthetic demo patients."""
    corr_id = getattr(request.state, "correlation_id", "local")
    patients = await fhir_adapter.list_patients()
    await audit_logger.log_event(
        action="FHIR_PATIENTS_LISTED",
        correlation_id=corr_id,
        details={"patient_count": len(patients)},
    )
    return patients


@router.get("/{patient_id}")
async def get_patient(patient_id: str, request: Request):
    """Retrieve full clinical summary for a specific synthetic patient."""
    corr_id = getattr(request.state, "correlation_id", "local")
    summary = await fhir_adapter.get_patient_summary(patient_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    await audit_logger.log_event(
        action="FHIR_PATIENT_ACCESSED",
        patient_id=patient_id,
        correlation_id=corr_id,
    )
    return summary
