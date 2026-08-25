from typing import List
from backend.app.fhir.models import PatientSummary

class DocumentationGapDetector:
    """Detects clinical documentation deficiencies that could trigger payer claim denials."""

    @staticmethod
    def detect_gaps(patient: PatientSummary, recommended_status: str) -> List[str]:
        gaps = []
        doc_texts = " ".join([d.get("description", "").lower() for d in patient.documents])

        # 1. Check for explicit physician inpatient admission order
        if recommended_status == "inpatient":
            if "admit to inpatient" not in doc_texts and "inpatient stay" not in doc_texts:
                gaps.append("Missing explicit physician certification statement specifying expected inpatient cross-midnight duration")

        # 2. Check for quantified treatment targets
        if "heart failure" in str(patient.conditions).lower():
            if "urine output" not in doc_texts and "target weight" not in doc_texts:
                gaps.append("Lack of quantified 24-hour urine output or dry weight goal in clinical progress notes")

        # 3. Check for baseline vs acute oxygen comparison in respiratory cases
        if "copd" in str(patient.conditions).lower():
            if "baseline" not in doc_texts and "home oxygen" not in doc_texts:
                gaps.append("Omission of baseline home oxygen requirements vs. acute escalation needs (critical for commercial appeal defense)")

        # 4. Check for telemetry indication justification
        if "syncope" in str(patient.conditions).lower():
            if "orthostatic" not in doc_texts:
                gaps.append("Missing documentation of orthostatic vital signs or syncope risk stratification protocol")

        return gaps
