import pytest
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.llm.guardrails import PHIGuardrail
from backend.app.llm.mock_adapter import MockLLMAdapter
from backend.app.llm.models import CostCalculator
from backend.app.ur_engine.engine import UREngine


def test_phi_guardrail_detects_real_ssn():
    safe_text = "Patient has history of COPD and was admitted at 10:00."
    is_safe, violations = PHIGuardrail.validate_content(safe_text)
    assert is_safe is True
    assert len(violations) == 0

    unsafe_text = "Patient SSN is 123-45-6789 and needs urgent care."
    is_safe, violations = PHIGuardrail.validate_content(unsafe_text)
    assert is_safe is False
    assert any("Social Security Number" in v for v in violations)


def test_cost_calculator_accuracy():
    # 1000 prompt tokens + 500 completion tokens on gemini-2.5-flash
    # input: 1000/1M * 0.075 = $0.000075
    # output: 500/1M * 0.30 = $0.00015
    # total = $0.000225
    cost = CostCalculator.calculate_cost("gemini-2.5-flash", 1000, 500)
    assert cost == 0.000225

    ollama_cost = CostCalculator.calculate_cost("ollama-gemma", 1000, 500)
    assert ollama_cost == 0.0


@pytest.mark.asyncio
async def test_mock_llm_adapter_narrative_generation():
    adapter = LocalFixtureFHIRAdapter()
    patient = await adapter.get_patient_summary("synthetic-pt-001")
    assert patient is not None

    ur_eval = UREngine.evaluate(patient)
    llm = MockLLMAdapter()
    res = await llm.generate_narrative(patient.model_dump(), ur_eval.model_dump())

    assert res.patient_id == "synthetic-pt-001"
    assert "heart failure" in res.narrative_text.lower()
    assert len(res.criteria_cited) > 0
    assert "human physician review" in res.disclaimer.lower()
    assert res.prompt_tokens > 0
    assert res.estimated_cost_usd > 0
