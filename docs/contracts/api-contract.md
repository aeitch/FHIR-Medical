# REST API Contract — ClinEfficiency UR Console

All endpoints require strict Pydantic v2 validation and carry `X-Correlation-ID` headers for end-to-end tracing.

## Base URL
`/api`

## Endpoints

### 1. Health & Readiness
- **`GET /health`**
  - **Description**: Returns basic liveness status.
  - **Response 200**:
    ```json
    { "status": "healthy", "timestamp": "2026-08-25T12:00:00Z" }
    ```
- **`GET /ready`**
  - **Description**: Checks readiness of dependencies (FHIR store, LLM provider, Firestore).
  - **Response 200**:
    ```json
    {
      "status": "ready",
      "fhir_store": "online",
      "llm_provider": "vertex_ai",
      "audit_store": "firestore",
      "timestamp": "2026-08-25T12:00:00Z"
    }
    ```

---

### 2. FHIR Patients
- **`GET /api/patients`**
  - **Description**: Lists all available synthetic demo patients.
  - **Response 200**:
    ```json
    [
      {
        "id": "synthetic-pt-001",
        "name": "James R. Miller",
        "gender": "male",
        "birthDate": "1958-04-12",
        "age": 68,
        "scenario": "Inpatient Admission (Severe Heart Failure Exacerbation)",
        "admission_date": "2026-08-24T08:30:00Z"
      }
    ]
    ```

- **`GET /api/patients/{patient_id}`**
  - **Description**: Retrieves full FHIR chart bundle (Patient, Encounters, Conditions, Observations, Procedures, Documents).
  - **Response 200**: Full structured patient chart summary.

---

### 3. Utilization Review (UR) Engine
- **`POST /api/ur/evaluate`**
  - **Description**: Evaluates clinical data against 2-midnight benchmark and observation-vs-inpatient criteria.
  - **Request Body**:
    ```json
    {
      "patient_id": "synthetic-pt-001",
      "expected_stay_hours": 48,
      "clinical_notes": "Patient presents with acute decompensated heart failure..."
    }
    ```
  - **Response 200**:
    ```json
    {
      "patient_id": "synthetic-pt-001",
      "recommended_status": "inpatient",
      "confidence_score": 0.94,
      "two_midnight_met": true,
      "severity_of_illness": "high",
      "intensity_of_service": "high",
      "criteria_met": [
        "IV loop diuretics titration required > 24h",
        "Continuous telemetry and supplemental O2",
        "Elevated NT-proBNP (>5,000 pg/mL) and Troponin monitoring"
      ],
      "documentation_gaps": [
        "Missing explicit physician order for inpatient admission",
        "Lack of quantified 24-hour urine output target in progress notes"
      ]
    }
    ```

---

### 4. LLM Payer Narrative Generation
- **`POST /api/narrative/generate`**
  - **Description**: Generates a payer-style medical necessity or appeal justification.
  - **Request Body**:
    ```json
    {
      "patient_id": "synthetic-pt-001",
      "target_payer": "Medicare Advantage / Commercial",
      "include_gap_remediation": true
    }
    ```
  - **Response 200**:
    ```json
    {
      "patient_id": "synthetic-pt-001",
      "narrative_text": "CLINICAL APPEAL / MEDICAL NECESSITY SUMMARY...",
      "criteria_cited": ["MCG M-190", "CMS 2-Midnight Rule (42 CFR 412.3)"],
      "model": "gemini-2.5-flash",
      "prompt_tokens": 1420,
      "completion_tokens": 460,
      "estimated_cost_usd": 0.00018,
      "disclaimer": "AI-generated decision support — requires human physician review before submission."
    }
    ```

---

### 5. Audit Trail & FinOps
- **`GET /api/audit`**
  - **Description**: Retrieves recent append-only audit trail logs.
  - **Query Params**: `limit=50`, `patient_id=optional`
  - **Response 200**:
    ```json
    [
      {
        "id": "audit-uuid-1234",
        "timestamp": "2026-08-25T12:05:10Z",
        "actor": "dr.uwah@clinefficiency.demo",
        "action": "NARRATIVE_GENERATED",
        "patient_id": "synthetic-pt-001",
        "correlation_id": "corr-uuid-5678",
        "model": "gemini-2.5-flash",
        "cost_usd": 0.00018
      }
    ]
    ```
- **`GET /api/audit/finops`**
  - **Description**: Aggregates token usage and estimated cloud LLM costs.
