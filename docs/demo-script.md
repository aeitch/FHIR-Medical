# The 10-Minute ClinEfficiency UR Console Client Walkthrough Script

This walkthrough demonstrates the **ClinEfficiency UR Console** to Dr. Augusta Uwah, mapping directly to her Phase-2 requirements and Acceptance Criteria (A1–A10).

---

## Timeline & Talking Points

### Minutes 0–2: Engineering Rigor & Git Trust Artifact (Criteria A4, A10)
- **Visual**: Show GitHub repository history (`git log --oneline -10`), Conventional Commits format, green GitHub Actions CI badge, and `AGENTS.md`.
- **Narrative**: *"Every two completed changes have been committed, formatted, and verified against unit tests and an 800-line modularity cap. The git commit history itself is proof of transparent, healthcare-grade engineering."*

### Minutes 2–4: Synthetic Patient & UR Decision Engine (Criteria A1, A6)
- **Visual**: Open the UR Console UI (`localhost:5173` or Cloud Run URL). Note the loud `"SYNTHETIC DEMO DATA — NO PHI"` banner.
- **Action**: Select **Patient 1 (James R. Miller - Heart Failure)**.
- **Narrative**: *"Here is our bounded workflow. The engine pulls from the FHIR R4 store and evaluates the CMS 2-Midnight Rule (42 CFR 412.3). It recognizes the severe hypoxemia and continuous IV diuretic need, recommending an Inpatient status with 95% confidence."*

### Minutes 4–6: Documentation Gaps & LLM Payer Appeal Narrative (Criteria A1, A5, A7)
- **Visual**: Highlight the **Flagged Documentation Gaps** card and generate the narrative using **Vertex AI (`gemini-2.5-flash`)**.
- **Action**: Click *Generate Narrative*. Show structured JSON output, cited MCG/CMS guidelines, and the embedded **"AI-generated decision support — requires human physician review"** disclaimer.
- **Narrative**: *"Vertex AI synthesizes chart facts into a payer-ready justification that auto-remediates documentation gaps without hallucinating clinical data."*

### Minutes 6–8: SMART on FHIR Interoperability & Zero-Cost Offline Fallback (Criteria A2, A9)
- **Visual**: Switch provider dropdown to **Local Ollama (`gemma`)** or reference `docs/smart-launch.md` and `docs/fhir-swap.md`.
- **Narrative**: *"Our typed repository adapter can switch from synthetic fixtures to live Epic EHR endpoints with zero code modifications. In offline mode, the system runs with local models at $0 cost."*

### Minutes 8–10: CLAIR Governance Audit Trail & Teardown Guarantee (Criteria A3, A7, A8)
- **Visual**: Scroll to the **FinOps Token/Cost Tracker** (showing cumulative cost ~$0.0002) and the **CLAIR Append-Only Audit Trail** with correlation IDs.
- **Narrative**: *"Every clinical evaluation and LLM token is permanently recorded with correlation IDs for HIPAA audit readiness. 100% of the infrastructure is in Terraform, meaning you own all assets and can deploy or cleanly destroy the environment in minutes."*
