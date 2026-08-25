# IP & Asset Ownership Manifest — ClinEfficiency Pro LLC

This manifest provides a complete inventory of custom engineering assets, code, configuration, versioned clinical prompts, and deployment assets delivered under full, unencumbered client IP ownership for **Dr. Augusta Uwah / ClinEfficiency Pro LLC**.

---

## 1. Asset Inventory

| Asset Category | File / Directory Location | Ownership & Description |
| :--- | :--- | :--- |
| **Frontend Application** | `frontend/` | React 19 + TypeScript + Vite + Tailwind CSS UR Console with FinOps widget and audit view. |
| **Backend API & Decision Engine** | `backend/app/` | FastAPI services: UR engine (`ur_engine/`), gap detection (`gap_detect/`), audit middleware (`audit/`), and REST routers (`routers/`). |
| **FHIR Repository Layer** | `backend/app/fhir/` | Typed FHIR R4 repository adapters (Local, GCP Cloud Healthcare API, SMART on FHIR). |
| **Versioned Clinical Prompts** | `backend/app/prompts/` | Versioned physician advisor appeal generator prompt templates (`physician_advisor_v1.txt`). |
| **Synthetic FHIR Fixtures** | `seed/` | 3 Synthea-aligned FHIR R4 patient bundles covering inpatient, observation, and denial risk scenarios. |
| **Infrastructure as Code** | `terraform/` | 100% Terraform modules for VPC, Cloud Run, Firestore, Healthcare API, and Secret Manager. |
| **CI/CD Pipelines** | `.github/workflows/` | Automated GitHub Actions CI workflow definitions with testing and quality gates. |
| **Governance & Security Docs** | `docs/` | HIPAA control mapping, security review, SMART launch specs, cost estimates, and demo scripts. |

---

## 2. Zero Vendor Lock-in Guarantee
All code, models, prompts, and Terraform configurations are standard open formats without proprietary wrapper locks. The repository and cloud infrastructure can be transferred to ClinEfficiency's GCP organization and GitHub account in a single operation.
