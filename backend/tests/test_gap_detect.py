import pytest
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.gap_detect.detector import DocumentationGapDetector

@pytest.mark.asyncio
async def test_gap_detector_identifies_missing_items():
    adapter = LocalFixtureFHIRAdapter()
    patient = await adapter.get_patient_summary("synthetic-pt-001")
    assert patient is not None

    gaps = DocumentationGapDetector.detect_gaps(patient, "inpatient")
    assert len(gaps) > 0
    assert any("physician certification" in g.lower() or "urine output" in g.lower() for g in gaps)

@pytest.mark.asyncio
async def test_copd_gap_detection_baseline_oxygen():
    adapter = LocalFixtureFHIRAdapter()
    patient = await adapter.get_patient_summary("synthetic-pt-003")
    assert patient is not None

    gaps = DocumentationGapDetector.detect_gaps(patient, "inpatient")
    assert any("baseline" in g.lower() for g in gaps)
