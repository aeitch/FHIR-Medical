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

    # Verify versioned /api/v1/health and /api/health
    res_v1 = client.get("/api/v1/health")
    assert res_v1.status_code == 200
    assert res_v1.json()["status"] == "healthy"

    res_api = client.get("/api/health")
    assert res_api.status_code == 200
    assert res_api.json()["status"] == "healthy"


def test_api_patients_flow():
    res = client.get("/api/patients?page=1&page_size=5")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert data["page"] == 1
    assert len(data["items"]) >= 3

    p0 = data["items"][0]
    res_single = client.get(f"/api/patients/{p0['id']}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == p0["id"]


def test_api_fhir_servers_registry():
    res = client.get("/api/patients/servers")
    assert res.status_code == 200
    servers = res.json()
    assert "epic" in servers
    assert "smart" in servers
    assert "hapi" in servers
    assert "r4.smarthealthit.org" in servers["smart"]["base_url"]


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


def test_fhir_metadata_capability_statement():
    res = client.get("/api/fhir/metadata")
    assert res.status_code == 200
    data = res.json()
    assert data["resourceType"] == "CapabilityStatement"
    assert data["fhirVersion"] == "4.0.1"
    assert data["software"]["name"] == "ClinEfficiency Pro UR Console"

    # Verify /api/v1 prefix also works
    res_v1 = client.get("/api/v1/fhir/metadata")
    assert res_v1.status_code == 200
    assert res_v1.json()["resourceType"] == "CapabilityStatement"


def test_api_patients_fetch_and_raw_bundle():
    # Test dynamic fetch by ID
    res_fetch = client.post("/api/patients/fetch", json={"patient_id": "erXuFYUfucBZaryVpgxafgw3", "provider": "epic"})
    assert res_fetch.status_code == 200
    assert res_fetch.json()["id"] == "erXuFYUfucBZaryVpgxafgw3"

    # Test raw bundle inspection
    res_raw = client.get("/api/patients/erXuFYUfucBZaryVpgxafgw3/raw")
    assert res_raw.status_code == 200
    assert res_raw.json()["resourceType"] == "Bundle"


def test_smart_launch_and_callback_endpoints():
    res_launch = client.get("/smart/launch", follow_redirects=False)
    assert res_launch.status_code in [302, 307]
    assert "fhir.epic.com" in res_launch.headers["location"]

    res_cb = client.get("/callback?code=mock_auth_code_12345&state=test_state")
    assert res_cb.status_code == 200
    assert "Epic on FHIR Connected" in res_cb.text


def test_unknown_patient_returns_404():
    # 1. GET unknown patient returns 404 (BUG 1 FIX)
    res_get = client.get("/api/patients/deadbeef-notreal")
    assert res_get.status_code == 404
    assert "not found" in res_get.json()["detail"].lower()

    # 2. POST fetch unknown patient returns 404
    res_fetch = client.post("/api/patients/fetch", json={"patient_id": "deadbeef-notreal"})
    assert res_fetch.status_code == 404
    assert "not found" in res_fetch.json()["detail"].lower()

    # 3. POST UR evaluate with unknown patient returns 404 without evaluating (BUG 2 FIX)
    res_ur = client.post("/api/ur/evaluate", json={"patient_id": "nope", "expected_stay_hours": 48})
    assert res_ur.status_code == 404
    assert "not found" in res_ur.json()["detail"].lower()

    # 4. POST narrative generate with unknown patient returns 404
    res_narrative = client.post("/api/narrative/generate", json={"patient_id": "nope"})
    assert res_narrative.status_code == 404
    assert "not found" in res_narrative.json()["detail"].lower()


def test_api_guardrail_blocks_unsafe_input():
    payload = {
        "patient_id": "synthetic-pt-001",
        "custom_context": "Real SSN 123-45-6789 should be rejected immediately.",
        "model_override": "mock-llm",
    }
    res = client.post("/api/narrative/generate", json=payload)
    assert res.status_code == 400
    assert "Security Guardrail Violation" in res.json()["detail"]
