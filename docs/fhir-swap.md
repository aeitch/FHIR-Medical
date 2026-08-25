# FHIR Adapter EHR Swap Guide — Synthetic to Enterprise Production

The ClinEfficiency UR Console uses the **Repository Pattern** to abstract FHIR R4 data access. Transitioning from synthetic sandbox test fixtures to a live hospital EHR (e.g. Epic, Oracle Health) is a zero-code-change configuration switch.

---

## 1. Adapter Abstraction Architecture

```
                 ┌────────────────────────────────┐
                 │  BaseFHIRAdapter (Protocol)    │
                 │  - list_patients()             │
                 │  - get_patient_summary(id)     │
                 │  - get_raw_bundle(id)          │
                 └──────────────┬─────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
┌──────────────────┐  ┌──────────────────┐    ┌─────────────────────┐
│ LocalFixture     │  │ GCPHealthcare    │    │ ProductionEHR       │
│ FHIRAdapter      │  │ FHIRAdapter      │    │ FHIRAdapter         │
│ (Synthetic Seed) │  │ (Cloud API)      │    │ (Epic / Hospital)   │
└──────────────────┘  └──────────────────┘    └─────────────────────┘
```

---

## 2. Configuration Swap Steps

To switch the active FHIR provider in production, update runtime environment variables (in Cloud Run or Secret Manager) without modifying backend source code:

```bash
# 1. Set Provider Type
FHIR_PROVIDER=gcp_healthcare   # options: 'local', 'gcp_healthcare', 'smart_ehr'

# 2. Configure GCP Cloud Healthcare API Endpoint (if using GCP Managed Store)
GCP_PROJECT_ID="your-prod-project"
GCP_LOCATION="us-central1"
GCP_DATASET_ID="prod_healthcare_dataset"
GCP_FHIR_STORE_ID="prod_fhir_store"

# 3. OR Configure Enterprise EHR Endpoint (Epic / Cerner)
EHR_FHIR_BASE_URL="https://fhir.hospital.org/api/FHIR/R4"
EHR_CLIENT_ID="clinefficiency-prod-client-id"
EHR_TOKEN_ENDPOINT="https://auth.hospital.org/oauth2/token"
```

---

## 3. Conformance & Validation Guarantee
Regardless of the backing store, the adapter normalizes responses into typed Pydantic v2 `PatientSummary` objects. All downstream clinical algorithms (UR engine, gap detection, narrative generation) remain 100% untouched.
