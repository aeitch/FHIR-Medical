# FinOps Infrastructure Cost Estimate — ClinEfficiency UR Console

The ClinEfficiency UR Console demonstration on Google Cloud Platform is engineered for **near-$0 idle run cost** and transparent per-invocation AI accounting.

---

## 1. Estimated Monthly Cloud Run & Infrastructure Costs

| GCP Service | Idle / Baseline Cost | Demo Day Cost (100+ Invocations) | Cost Notes |
| :--- | :--- | :--- | :--- |
| **Cloud Run (Backend & Frontend)** | **$0.00 / month** | **<$0.02 / day** | Scales to zero instances when idle; included in free tier (first 2M requests/month free). |
| **Google Cloud Healthcare API (FHIR R4)** | **$0.00 / month** | **<$0.01 / day** | Minimal storage consumption for synthetic fixtures; covered by initial tier. |
| **Cloud Firestore (Audit Store)** | **$0.00 / month** | **<$0.01 / day** | 50,000 document reads & 20,000 document writes per day in free tier. |
| **GCP Secret Manager** | **$0.00 / month** | **$0.00 / day** | First 6 active secret versions free per month. |
| **Cloud Storage (GCS Artifacts)** | **$0.00 / month** | **<$0.01 / day** | 5 GB standard storage included in free tier. |
| **Estimated Total Infrastructure** | **~$0.00 / month** | **<$0.05 / demo day** | Fully protected by GCP Budgets alert threshold. |

---

## 2. Vertex AI LLM Narrative Generation Costs (`gemini-2.5-flash`)

| Metric | Flash Tier Pricing | Per Demonstration Narrative | 100 Demo Runs |
| :--- | :--- | :--- | :--- |
| **Prompt / Input Tokens** | $0.075 / 1,000,000 tokens | ~1,250 tokens = **$0.000094** | **$0.0094** |
| **Completion / Output Tokens** | $0.300 / 1,000,000 tokens | ~380 tokens = **$0.000114** | **$0.0114** |
| **Total Cost Per Narrative** | — | **~$0.000208** | **~$0.0208** |

*Local fallback via Ollama (`gemma`) operates completely free of charge ($0.00).*
