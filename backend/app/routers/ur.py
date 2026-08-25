from backend.app.audit.logger import audit_logger
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.ur_engine.engine import UREngine
from backend.app.ur_engine.models import UREvaluationRequest, UREvaluationResponse
from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/ur", tags=["Utilization Review"])
fhir_adapter = LocalFixtureFHIRAdapter()


@router.post("/evaluate", response_model=UREvaluationResponse)
async def evaluate_patient(payload: UREvaluationRequest, request: Request):
    """Run utilization review decision engine against patient clinical data."""
    corr_id = getattr(request.state, "correlation_id", "local")
    summary = await fhir_adapter.get_patient_summary(payload.patient_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Patient {payload.patient_id} not found")

    evaluation = UREngine.evaluate(summary, expected_hours=payload.expected_stay_hours or 48)

    await audit_logger.log_event(
        action="UR_DECISION_EVALUATED",
        patient_id=payload.patient_id,
        correlation_id=corr_id,
        details={
            "recommended_status": evaluation.recommended_status,
            "confidence_score": evaluation.confidence_score,
            "two_midnight_met": evaluation.two_midnight_met,
        },
    )
    return evaluation
