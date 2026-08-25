# ClinEfficiency Pro — Utilization Review (UR) Console

[![CI & Governance Checks](https://github.com/aeitch/FHIR-Medical/actions/workflows/ci.yml/badge.svg)](https://github.com/aeitch/FHIR-Medical/actions/workflows/ci.yml)
[![FHIR](https://img.shields.io/badge/HL7_FHIR-R4-blue.svg)](https://hl7.org/fhir/R4/)
[![Cloud](https://img.shields.io/badge/GCP-Cloud_Run-4285F4.svg)](https://cloud.google.com/run)
[![AI](https://img.shields.io/badge/Vertex_AI-Gemini_2.5_Flash-8E75B2.svg)](https://cloud.google.com/vertex-ai)
[![Compliance](https://img.shields.io/badge/HIPAA_Readiness-45_CFR_164.312-teal.svg)](docs/hipaa-control-map.md)

An enterprise healthcare demonstration for **ClinEfficiency Pro LLC (Dr. Augusta Uwah)**, featuring automated **Observation vs. Inpatient utilization review**, **SMART on FHIR 2.0 app launch interoperability (Epic on FHIR sandbox integration)**, **Vertex AI medical necessity narrative synthesis**, and an **immutable append-only audit trail** with live FinOps token/cost tracking.

---

## 🌐 Live Production Deployment

| Service | Live Endpoint | Description |
| :--- | :--- | :--- |
| **UR Console Web Application** | [**https://clinefficiency-frontend-256461781819.us-central1.run.app**](https://clinefficiency-frontend-256461781819.us-central1.run.app) | Responsive React 19 console with synthetic patient picker, UR cards, and FinOps tracker. |
| **Terms of Use & Privacy** | [**https://clinefficiency-frontend-256461781819.us-central1.run.app/terms**](https://clinefficiency-frontend-256461781819.us-central1.run.app/terms) | Registered Terms of Use and healthcare data privacy policy for Epic on FHIR. |
| **Backend REST API** | [**https://clinefficiency-backend-256461781819.us-central1.run.app**](https://clinefficiency-backend-256461781819.us-central1.run.app) | FastAPI microservices for clinical decision logic, FHIR repository, and LLM adapters. |
| **Interactive API Documentation** | [**https://clinefficiency-backend-256461781819.us-central1.run.app/docs**](https://clinefficiency-backend-256461781819.us-central1.run.app/docs) | Swagger UI for exploring and testing API endpoints directly. |
| **SMART OAuth2 Callback Endpoint** | [**https://clinefficiency-backend-256461781819.us-central1.run.app/callback**](https://clinefficiency-backend-256461781819.us-central1.run.app/callback) | Registered OAuth2 redirect URI for Epic on FHIR App Launch. |

---

## 🏥 Architecture & Core Workflow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              REACT 19 + VITE CONSOLE                                  │
│   • Synthetic Patient Selector (Cardiac, Syncope, Respiratory Admission Profiles)      │
│   • Observation vs. Inpatient Decision Card + CMS 2-Midnight Rule (42 CFR § 412.3)    │
│   • Clinical Documentation Gap Remediation + Payer Appeal Generator                    │
│   • Live FinOps Token/Cost Widget + CLAIR Append-Only Audit Trail View                 │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / JSON (X-Correlation-ID)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND SERVICES (CLOUD RUN)                           │
│   ├── /api/patients, /api/fhir/*   ──► Dynamic FHIR R4 Repository Adapter             │
│   ├── /api/ur/evaluate             ──► Severity of Illness (SI) & Intensity of Service│
│   ├── /api/narrative/generate      ──► Vertex AI (gemini-2.5-flash) with Ollama Fallback│
│   ├── /api/audit                   ──► Append-Only Firestore Audit Middleware          │
│   └── /callback, /smart/launch     ──► SMART on FHIR OAuth2 Handshake                  │
└──────────────┬────────────────────────────┬─────────────────────────────┬──────────────┘
               ▼                            ▼                             ▼
┌─────────────────────────────┐ ┌───────────────────────────┐ ┌──────────────────────────┐
│       FHIR R4 DATA          │ │     LLM & SECRETS         │ │  AUDIT & OBSERVABILITY   │
│ • Epic on FHIR Open Sandbox │ │ • Google Vertex AI        │ │ • Cloud Firestore        │
│ • GCP Cloud Healthcare API  │ │   (gemini-2.5-flash)      │ │   Append-Only Audit Log  │
│ • Synthea R4 Seed Fixtures  │ │ • GCP Secret Manager      │ │ • Distributed Trace ID   │
└─────────────────────────────┘ └───────────────────────────┘ └──────────────────────────┘
```

---

## ⚡ Key Highlights

1. **Healthcare Interoperability (HL7 FHIR R4)**:
   * Abstracted repository pattern supporting **Epic on FHIR Open Sandbox**, **Google Cloud Healthcare API (FHIR Store)**, and local test bundles.
   * Registered for SMART App Launch with dedicated OAuth2 callback handlers.
2. **Clinical Utilization Review Engine**:
   * Evaluates patient physiological stability, biomarker thresholds (Troponin, NT-proBNP, PaCO2), and continuous IV treatment requirements against the **CMS 2-Midnight Benchmark (42 CFR § 412.3)**.
3. **Payer-Style Medical Necessity Narratives**:
   * Generates formal, evidence-backed appeal letters citing recognized guidelines (CMS, MCG, InterQual, GOLD COPD) via **Google Vertex AI (`gemini-2.5-flash`)**.
   * Automatically remediates flagged documentation gaps while embedding mandatory *"AI-generated decision support — requires human physician review"* disclaimers.
4. **CLAIR Governance & Audit Immutability**:
   * Every FHIR pull, UR decision, and LLM invocation is recorded in **Cloud Firestore** using an `INSERT-only` IAM policy (no update/delete permissions) with end-to-end `X-Correlation-ID` tracing.
5. **FinOps Cost Transparency**:
   * Near-$0 idle cost architecture (serverless Cloud Run scaling to 0) and live per-call token accounting (~**$0.00019** per appeal).
6. **100% Infrastructure as Code**:
   * Fully codified in **Terraform** (`>= 1.5`), ensuring reproducible single-command provisioning and clean `terraform destroy` teardown.

---

## 🚀 Quickstart

### Prerequisites
- Node.js `v20+` & `npm`
- Python `3.11+` & `uv`
- Terraform `>= 1.5`

### 1. Run Backend Locally
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# Run full test suite
pytest -v

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Run Frontend Locally
```bash
cd frontend
npm install

# Run type check and linter
npm run lint

# Start Vite development server on port 5173
npm run dev
```

Visit **`http://localhost:5173`** to interact with the local console.

---

## 🧪 Quality Gates & Verification

All commits must pass the automated verification checks before merging:

```bash
# Backend Verification (FastAPI / Ruff / Pytest)
cd backend && ruff check . && ruff format --check . && pytest -v

# Frontend Verification (TypeScript Strict / ESLint 9 / Vite Build)
cd frontend && npm run lint && npx tsc --noEmit && npm run build

# Terraform Validation (GCP Modules)
cd terraform/environments/demo && terraform fmt -check && terraform init -backend=false && terraform validate

# 800-Line Modularity File Cap Check
find backend frontend terraform docs -type d \( -name ".venv" -o -name "node_modules" -o -name ".terraform" -o -name "dist" \) -prune -o -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" -o -name "*.tf" -o -name "*.md" \) -print | while read -r f; do [ $(wc -l < "$f") -gt 800 ] && echo "FAIL: $f > 800 lines" && exit 1; done
```

---

## 📁 Repository Structure

```
FHIR-Medical/
├── .github/workflows/ci.yml       # GitHub Actions CI (lint, test, build, file-size check)
├── docs/
│   ├── contracts/                 # REST API, FHIR adapter, LLM adapter, infra contracts
│   ├── hipaa-control-map.md       # 45 CFR § 164.312 technical safeguards readiness mapping
│   ├── security-review.md         # Threat model, IAM least privilege, guardrails
│   ├── smart-launch.md            # SMART on FHIR 2.0 launch pattern specification
│   ├── fhir-swap.md               # EHR swap guide (synthetic to enterprise production)
│   ├── cost-estimate.md           # FinOps cost breakdown and token pricing models
│   ├── ownership-manifest.md      # Complete client IP inventory for handover
│   └── demo-script.md             # 10-minute client walkthrough script
├── seed/                          # Synthea FHIR R4 test patient bundles
├── backend/
│   ├── app/
│   │   ├── fhir/                  # FHIR adapters (Epic, GCP Healthcare API, Local fixtures)
│   │   ├── ur_engine/             # Observation vs. Inpatient clinical decision logic
│   │   ├── gap_detect/            # Documentation gap detector
│   │   ├── llm/                   # Vertex AI Gemini & Ollama adapters with PHI guardrails
│   │   ├── prompts/               # Versioned physician advisor prompt templates
│   │   ├── audit/                 # Append-only Firestore logger & tracing middleware
│   │   └── routers/               # Patients, UR, Narrative, Audit, and SMART OAuth routers
│   ├── tests/                     # Comprehensive pytest unit and integration test suite
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/            # PatientSelector, URDecisionCard, NarrativeViewer, FinOpsWidget, TermsPage
│   │   ├── services/              # API client and TypeScript definitions
│   │   └── App.tsx                # Master layout and state management
│   └── package.json
├── terraform/
│   ├── modules/                   # VPC, Cloud Run, Healthcare FHIR, Firestore, Storage, Secrets
│   └── environments/demo/         # Root demo environment wiring and variables
├── AGENTS.md                      # Governance rules, commit cadence, 800-line cap
└── README.md                      # Project documentation and quickstart
```

---

## 🔒 Healthcare Compliance & IP Ownership

- **Synthetic Data Guarantee**: Operates exclusively with synthetic test fixtures; automated regex guardrail blocks real-world identifiers.
- **HIPAA Readiness Discipline**: Framed as technical safeguards readiness under 45 CFR § 164.312 (strictly no claims of formal certification).
- **Full Client Ownership**: 100% custom code, prompts, schemas, and infrastructure are transfer-ready with zero vendor lock-in.
