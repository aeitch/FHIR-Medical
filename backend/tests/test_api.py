from backend.app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health_and_readiness_endpoints():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res = client.get("/ready")
    assert res.status_code == 200
    assert res.json()["status"] == "ready"


def test_api_patients_flow():
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) == 3

    p0 = patients[0]
    res_single = client.get(f"/api/patients/{p0['id']}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == p0["id"]


def test_api_ur_evaluate_flow():
    payload = {"patient_id": "synthetic-pt-001", "expected_stay_hours": 48}
    res = client.post("/api/ur/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["recommended_status"] == "inpatient"
    assert data["two_midnight_met"] is True
    assert "X-Correlation-ID" in res.headers


def test_api_narrative_generate_and_audit():
    payload = {
        "patient_id": "synthetic-pt-001",
        "target_payer": "Medicare Advantage",
        "model_override": "mock-llm",
    }
    res = client.post("/api/narrative/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "narrative_text" in data
    assert data["prompt_tokens"] > 0

    # Verify audit log recorded the action
    res_audit = client.get("/api/audit?limit=10")
    assert res_audit.status_code == 200
    logs = res_audit.json()
    assert len(logs) > 0
    assert any(l["action"] == "NARRATIVE_GENERATED" for l in logs)


def test_api_guardrail_blocks_unsafe_input():
    payload = {
        "patient_id": "synthetic-pt-001",
        "custom_context": "Real SSN 123-45-6789 should be rejected immediately.",
        "model_override": "mock-llm",
    }
    res = client.post("/api/narrative/generate", json=payload)
    assert res.status_code == 400
    assert "Security Guardrail Violation" in res.json()["detail"]
