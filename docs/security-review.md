# Security & Governance Review — ClinEfficiency UR Console

This document outlines the security architecture, threat model mitigations, and compliance safeguards implemented across the ClinEfficiency UR Console demonstration on Google Cloud Platform.

---

## 1. Threat Model & Mitigations

```
[Threat Vector]                    [Mitigation Implemented]
1. Real PHI Ingestion        ───►  Loud UI banner + Automated regex guardrail (SSN/Phone/MRN filter)
2. Credential Leakage        ───►  GCP Secret Manager + ADC + Gitignore + Pre-commit scanners
3. Privilege Escalation      ───►  Least-privilege Service Accounts (roles/aiplatform.user, roles/datastore.user)
4. Audit Tampering           ───►  Append-only Firestore collections (No update/delete permissions)
5. AI Clinical Hallucination ───►  Deterministic prompt grounding + Mandatory human review disclaimer
```

---

## 2. Principle of Least Privilege (IAM Architecture)

The backend Cloud Run service runs under an isolated GCP Service Account (`clinefficiency-backend-sa`) restricted to the following minimum roles:
1. `roles/aiplatform.user` — Execute predictions on Vertex AI (`gemini-2.5-flash`).
2. `roles/datastore.user` — Append records to the Firestore audit collection.
3. `roles/healthcare.fhirResourceReader` — Read-only access to synthetic FHIR store datasets.
4. `roles/secretmanager.secretAccessor` — Read secrets from Secret Manager at runtime.

No administrative or broad project-owner permissions are granted.

---

## 3. Zero PHI Data Containment

1. **Synthetic Bundles Only**: The repository contains 3 Synthea-generated FHIR R4 patient fixtures under `seed/`.
2. **UI Guardrail Banner**: Prominently rendered across the top navigation bar:
   `"SYNTHETIC DEMO DATA — NO REAL PHI — HIPAA & SOC 2 READINESS DEMONSTRATION"`
3. **Automated Input Guardrail (`backend/app/llm/guardrails.py`)**:
   - Inspects all clinical inputs for real-world SSN formats, telephone numbers, and financial data.
   - Throws `HTTP 400 Security Guardrail Violation` and logs a security audit event on any match.
   - Fully covered in automated test suite (`backend/tests/test_llm.py`).

---

## 4. Supply Chain & Dependency Hygiene

- Python dependencies managed via `uv` with pinned versions in `pyproject.toml`.
- Frontend dependencies strictly audited with `npm audit` (0 vulnerabilities).
- CI pipeline automatically validates all dependencies, runs static security checks, and enforces an 800-line source file cap.
