import pytest
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.ur_engine.engine import UREngine


@pytest.mark.asyncio
async def test_inpatient_evaluation_heart_failure():
    adapter = LocalFixtureFHIRAdapter()
    patient = await adapter.get_patient_summary("synthetic-pt-001")
    assert patient is not None
    assert patient.full_name == "Camila Lopez"

    evaluation = UREngine.evaluate(patient, expected_hours=48)
    assert evaluation.recommended_status == "inpatient"
    assert evaluation.two_midnight_met is True
    assert evaluation.severity_of_illness == "high"
    assert evaluation.intensity_of_service == "high"
    assert evaluation.confidence_score >= 0.90
    assert any("loop diuretic" in c.lower() for c in evaluation.criteria_met)


@pytest.mark.asyncio
async def test_observation_evaluation_syncope():
    adapter = LocalFixtureFHIRAdapter()
    patient = await adapter.get_patient_summary("synthetic-pt-002")
    assert patient is not None
    assert patient.full_name == "Derrick Lin"

    evaluation = UREngine.evaluate(patient, expected_hours=24)
    assert evaluation.recommended_status == "observation"
    assert evaluation.two_midnight_met is False
    assert evaluation.severity_of_illness in ["low", "moderate"]
    assert evaluation.confidence_score >= 0.80
    assert any("observation services" in c.lower() for c in evaluation.criteria_met)


@pytest.mark.asyncio
async def test_inpatient_evaluation_copd_hypercapnia():
    adapter = LocalFixtureFHIRAdapter()
    patient = await adapter.get_patient_summary("synthetic-pt-003")
    assert patient is not None
    assert patient.full_name == "Jason R. Miller"

    evaluation = UREngine.evaluate(patient, expected_hours=48)
    assert evaluation.recommended_status == "inpatient"
    assert evaluation.two_midnight_met is True
    assert any("bipap" in c.lower() for c in evaluation.criteria_met)
