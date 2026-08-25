# ClinEfficiency Pro — UR Console (Utilization Review)

A production-grade, portable healthcare demonstration built 100% on **Google Cloud Platform (GCP)** and deployed with **Terraform Infrastructure-as-Code**.

---

## 🏥 Architecture & Key Capabilities

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              REACT 19 + VITE FRONTEND                                  │
│   • Synthetic Patient Selector (3 Synthea Scenarios: Inpatient, Borderline, Denial)    │
│   • Observation vs. Inpatient UR Decision Card + Clinical Gap Flags                    │
│   • Payer Narrative Generator + FinOps Cost Widget ($0 / Token Tracker)                │
│   • Append-Only Audit Trail View (CLAIR Governance Story)                              │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / JSON (correlation_id)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (CLOUD RUN CONTAINER)                           │
│   • /health & /ready (Liveness / Readiness)                                            │
│   • /api/patients, /api/fhir/* (FHIR R4 Repository Adapter)                            │
│   • /api/ur/evaluate (Obs vs Inpatient Engine + Documentation Gap Detector)            │
│   • /api/narrative/generate (Vertex AI gemini-2.5-flash + Ollama Gemma Fallback)       │
│   • /api/audit (Append-Only Middleware -> Firestore)                                   │
└──────────────┬────────────────────────────┬─────────────────────────────┬──────────────┘
               ▼                            ▼                             ▼
┌─────────────────────────────┐ ┌───────────────────────────┐ ┌──────────────────────────┐
│       FHIR R4 DATA          │ │     LLM & SECRETS         │ │  AUDIT & OBSERVABILITY   │
│ • GCP Cloud Healthcare API  │ │ • Vertex AI               │ │ • Firestore Append-Only  │
│   FHIR Store (Managed)      │ │   (gemini-2.5-flash)      │ │   Audit Table            │
│ • Or Containerized HAPI     │ │ • GCP Secret Manager      │ │ • Cloud Logging (JSON)   │
│ • 3 Synthea Demo Bundles    │ │ • Local Ollama Fallback   │ │ • Correlation ID Tracing │
└─────────────────────────────┘ └───────────────────────────┘ └──────────────────────────┘
```

1. **Healthcare Interoperability (SMART on FHIR)**: Pulls synthetic patient fixtures from a typed FHIR R4 repository adapter (GCP Healthcare API / Synthea seed bundles).
2. **Clinical Decision Engine**: Evaluates CMS 2-Midnight Rule (42 CFR 412.3) for Observation vs. Inpatient status and flags clinical documentation gaps.
3. **Payer Appeal Narrative**: Generates evidence-cited medical necessity appeals via **Vertex AI (`gemini-2.5-flash`)** with offline local **Ollama (`gemma`)** fallback.
4. **Append-Only Governance & Audit**: Immutable audit logging (Firestore `INSERT-only` IAM model) with distributed correlation IDs and real-time **FinOps token/cost tracking**.
5. **100% Terraform IaC**: Single-command provisioning and clean `terraform destroy` teardown.

---

## 🚀 Quickstart from Clean Clone

### Prerequisites
- Node.js `v20+` & `npm`
- Python `3.11+` & `uv`
- Terraform `>= 1.5`
- (Optional) `gcloud` CLI & Google Cloud account

### 1. Backend Setup & Run
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# Run test suite
pytest -v

# Run backend development server (port 8000)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup & Run
```bash
cd frontend
npm install

# Build & type check
npm run build

# Start frontend development server (port 5173)
npm run dev
```

Visit **`http://localhost:5173`** to interact with the live UR Console.

---

## 🧪 Verification & Quality Checks

```bash
# Backend Lint & Formatting Check
cd backend && ruff check . && ruff format --check .

# Frontend Lint & Type Check
cd frontend && npm run lint && npx tsc --noEmit

# Terraform Format & Validation
cd terraform/environments/demo && terraform fmt -check && terraform init -backend=false && terraform validate
```

---

## 🔒 Compliance & Governance Discipline

- **Synthetic Data Only**: Non-negotiable zero-PHI guardrail actively blocks any real-world identifiers.
- **HIPAA Technical Safeguards Readiness**: Architecture engineered toward 45 CFR § 164.312 safeguards (see `docs/hipaa-control-map.md`).
- **Client IP Ownership**: 100% custom code, prompts, schemas, and infrastructure transfer-ready (see `docs/ownership-manifest.md`).
- **2-Change Commit Cadence**: Granular conventional commit history maintained across all changes.
- **800-Line File Cap**: Strictly enforced across all source modules.
