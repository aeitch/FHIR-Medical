from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from backend.app.llm.models import NarrativeResponse
from backend.app.llm.guardrails import PHIGuardrail
from backend.app.llm.gemini_adapter import VertexAIGeminiAdapter
from backend.app.llm.ollama_adapter import OllamaGemmaAdapter
from backend.app.llm.mock_adapter import MockLLMAdapter
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.ur_engine.engine import UREngine
from backend.app.audit.logger import audit_logger

router = APIRouter(prefix="/narrative", tags=["LLM Narrative"])

class GeneratePayload(BaseModel):
    patient_id: str
    target_payer: Optional[str] = "Medicare Advantage / Commercial"
    model_override: Optional[str] = "gemini-2.5-flash"
    custom_context: Optional[str] = None

@router.post("/generate", response_model=NarrativeResponse)
async def generate_narrative_endpoint(payload: GeneratePayload, request: Request):
    """Generate payer-style medical necessity narrative via Vertex AI or fallback."""
    corr_id = getattr(request.state, "correlation_id", "local")

    # 1. Zero-PHI Security Guardrail
    if payload.custom_context:
        is_safe, violations = PHIGuardrail.validate_content(payload.custom_context)
        if not is_safe:
            await audit_logger.log_event(
                action="SECURITY_GUARDRAIL_BLOCKED_PHI",
                patient_id=payload.patient_id,
                correlation_id=corr_id,
                details={"violations": violations},
            )
            raise HTTPException(
                status_code=400,
                detail=f"Security Guardrail Violation: Input rejected due to potential real PHI: {violations}",
            )

    # 2. Fetch Patient Data & UR Evaluation
    fhir_adapter = LocalFixtureFHIRAdapter()
    summary = await fhir_adapter.get_patient_summary(payload.patient_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Patient {payload.patient_id} not found")

    ur_eval = UREngine.evaluate(summary)

    # 3. Select Provider Adapter
    model_choice = (payload.model_override or "gemini-2.5-flash").lower()
    if "ollama" in model_choice:
        adapter = OllamaGemmaAdapter()
    elif "mock" in model_choice:
        adapter = MockLLMAdapter()
    else:
        adapter = VertexAIGeminiAdapter(model_name="gemini-2.5-flash")

    # 4. Generate Narrative
    narrative_res = await adapter.generate_narrative(
        patient_summary=summary.model_dump(),
        ur_decision=ur_eval.model_dump(),
        target_payer=payload.target_payer or "Medicare Advantage / Commercial",
        correlation_id=corr_id,
    )

    # 5. Immutable Audit Log with FinOps cost and token tracking
    await audit_logger.log_event(
        action="NARRATIVE_GENERATED",
        patient_id=payload.patient_id,
        correlation_id=corr_id,
        model=narrative_res.model_used,
        cost_usd=narrative_res.estimated_cost_usd,
        prompt_tokens=narrative_res.prompt_tokens,
        completion_tokens=narrative_res.completion_tokens,
        details={
            "criteria_count": len(narrative_res.criteria_cited),
            "latency_ms": narrative_res.latency_ms,
        },
    )

    return narrative_res
