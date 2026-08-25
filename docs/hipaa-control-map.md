# HIPAA Technical Safeguards (45 CFR § 164.312) Control Mapping

> **Important Compliance Disclaimer**: This architecture is engineered toward technical readiness aligned with the HIPAA Security Rule (45 CFR Part 160 and Part 164, Subparts A and C) and SOC 2 Trust Services Criteria. This document reflects technical readiness engineering and architectural safeguards; it does not constitute formal legal certification or attestation.

---

## 1. Access Control (45 CFR § 164.312(a))

| Standard & Specification | Implementation Safeguard in UR Console | Verification Artifact |
| :--- | :--- | :--- |
| **Unique User Identification (§ 164.312(a)(2)(i))** | Every API and LLM invocation logs the unique authenticated actor (`actor` field) and correlates operations via `correlation_id`. | `backend/app/audit/logger.py` |
| **Emergency Access Procedure (§ 164.312(a)(2)(ii))** | Direct IAM role-based break-glass access policies defined via Terraform for authorized GCP administrators. | `terraform/modules/cloud_run/main.tf` |
| **Automatic Logoff (§ 164.312(a)(2)(iii))** | Frontend session timeout configured with state clear and re-authentication challenge. | `frontend/src/App.tsx` |
| **Encryption and Decryption (§ 164.312(a)(2)(iv))** | Google Cloud Default / Customer Managed Encryption Keys (CMEK) applied to Cloud Storage buckets, Firestore, and Secret Manager at rest. | `terraform/modules/storage/main.tf` |

---

## 2. Audit Controls (45 CFR § 164.312(b))

| Standard & Specification | Implementation Safeguard in UR Console | Verification Artifact |
| :--- | :--- | :--- |
| **Audit Mechanisms (§ 164.312(b))** | Dedicated append-only Firestore collection (`ur_audit_logs`) with `INSERT-only` IAM policy (no update/delete permissions granted to backend service account). Captures all FHIR data pulls, UR clinical status evaluations, and LLM narrative generations. | `backend/app/audit/logger.py`, `terraform/modules/cloud_run/main.tf` |
| **End-to-End Tracing** | Unique `X-Correlation-ID` header injected on ingress, propagated through FastAPI middleware, passed to LLM adapter, and indexed in Firestore. | `backend/app/audit/middleware.py` |

---

## 3. Data Integrity Controls (45 CFR § 164.312(c))

| Standard & Specification | Implementation Safeguard in UR Console | Verification Artifact |
| :--- | :--- | :--- |
| **Mechanism to Authenticate ePHI (§ 164.312(c)(2))** | Strict Pydantic v2 data models validate FHIR R4 schema compliance on every request; invalid or corrupted payloads are rejected prior to processing. | `backend/app/fhir/models.py` |
| **Synthetic-Only Data Containment** | Non-negotiable architectural boundary: only Synthea-generated synthetic test fixtures are processed. Automated regex PHI guardrail rejects and logs real-world identifier patterns. | `backend/app/llm/guardrails.py` |

---

## 4. Transmission Security (45 CFR § 164.312(e))

| Standard & Specification | Implementation Safeguard in UR Console | Verification Artifact |
| :--- | :--- | :--- |
| **Integrity Controls (§ 164.312(e)(2)(i))** | TLS 1.3/1.2 enforced across all Cloud Run HTTPS endpoints; plain HTTP is automatically redirected/blocked. | `terraform/modules/cloud_run/main.tf` |
| **Encryption in Transit (§ 164.312(e)(2)(ii))** | All egress network communication to Vertex AI and Google Cloud Healthcare API encrypted via TLS. | `backend/app/fhir/gcp_healthcare_adapter.py` |
