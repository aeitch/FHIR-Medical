# AGENTS.md — ClinEfficiency Pro UR Console Governance & Rules

## 1. Project Overview
The ClinEfficiency Pro **UR Console (Utilization Review)** is a portable, production-grade healthcare demonstration running 100% on **Google Cloud Platform (GCP)**. It integrates:
- **Interoperability**: HL7 FHIR R4 repository with SMART on FHIR launch pattern (GCP Healthcare API / containerized HAPI / synthetic fixtures).
- **Clinical Logic**: Observation vs. Inpatient utilization review decision engine + documentation gap detection.
- **AI/LLM Narrative**: Payer-style medical necessity and appeal narrative generation powered by **Vertex AI (`gemini-2.5-flash`)** with offline local **Ollama (`gemma`)** fallback.
- **Governance & Audit**: Append-only audit trail stored in Google Cloud Firestore with per-call correlation IDs and FinOps token/cost tracking.
- **Infrastructure**: 100% Terraform IaC (`>= 1.9`) ensuring single-command provisioning and clean `terraform destroy`.

---

## 2. Universal Non-Negotiable Rules

### R1: 2-Change Commit Cadence
- Commit and push to git after **every TWO completed changes/tasks**.
- Use Conventional Commits format (`feat(...)`, `fix(...)`, `chore(...)`, `docs(...)`, `ci(...)`).
- The git commit history is a primary client-facing trust and audit artifact.

### R2: Hard 800-Line File Cap
- **No single source file may exceed 800 lines.**
- Refactor proactively into modular, single-responsibility files at ~600 lines.
- Enforced automatically in CI.

### R3: Synthetic Data Only — Zero PHI
- Process **SYNTHETIC test fixtures only** (Synthea R4 bundles).
- Loud UI banner: `"SYNTHETIC DEMO DATA — NO PHI"`.
- Backend regex/pattern guardrail that actively blocks and logs any real-PHI-like input.

### R4: Compliance & Language Discipline
- Frame all compliance work as **"Engineering toward HIPAA (45 CFR 164.312) and SOC 2 technical readiness"**.
- **NEVER** claim or write the words *"HIPAA certified"* or *"HIPAA compliant"* anywhere in code, docs, or UI.

### R5: Zero Secrets in Version Control
- Never commit `.env`, `*.tfstate`, Service Account JSON keys, or API tokens.
- Inject secrets via **GCP Secret Manager** or runtime environment variables.

---

## 3. Standard Build, Test, & Verification Commands

### Backend (Python 3.12+ / FastAPI / uv)
```bash
# Install dependencies
cd backend && uv venv && source .venv/bin/activate && uv pip install -e ".[dev]"

# Run test suite
pytest -v

# Lint & formatting check
ruff check .
ruff format --check .
```

### Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
```bash
# Install dependencies
cd frontend && npm install

# Type check & lint
npm run lint
npx tsc --noEmit

# Build production bundle
npm run build
```

### Infrastructure (Terraform GCP)
```bash
# Format & Validate
cd terraform/environments/demo
terraform fmt -check
terraform init -backend=false
terraform validate
```

---

## 4. Definition of Done
A feature or task is done only when:
1. Code conforms to type hints (Python Pydantic v2 / TypeScript strict mode).
2. Pytest unit tests pass with zero regressions.
3. ESLint, Prettier, and Vite builds succeed without warnings.
4. Source files are strictly under 800 lines.
5. Code is committed and pushed within the 2-change commit cadence.
