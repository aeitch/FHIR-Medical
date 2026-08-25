import pytest
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter


@pytest.mark.asyncio
async def test_list_synthetic_patients():
    adapter = LocalFixtureFHIRAdapter()
    patients = await adapter.list_patients()
    assert len(patients) == 3
    ids = [p["id"] for p in patients]
    assert "synthetic-pt-001" in ids
    assert "synthetic-pt-002" in ids
    assert "synthetic-pt-003" in ids


@pytest.mark.asyncio
async def test_get_patient_summary_fields():
    adapter = LocalFixtureFHIRAdapter()
    summary = await adapter.get_patient_summary("synthetic-pt-001")
    assert summary is not None
    assert summary.id == "synthetic-pt-001"
    assert summary.mrn == "SYNTH-MRN-1001"
    assert summary.gender == "male"
    assert summary.age > 0
    assert len(summary.conditions) >= 1
    assert len(summary.observations) >= 2
    assert len(summary.documents) >= 1


@pytest.mark.asyncio
async def test_get_raw_bundle():
    adapter = LocalFixtureFHIRAdapter()
    bundle = await adapter.get_raw_bundle("synthetic-pt-002")
    assert bundle is not None
    assert bundle.get("resourceType") == "Bundle"
    assert len(bundle.get("entry", [])) > 0
