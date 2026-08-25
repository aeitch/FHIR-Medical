from backend.app.fhir.models import PatientSummary


class DocumentationGapDetector:
    """Detects clinical documentation deficiencies that could trigger payer claim denials."""

    @staticmethod
    def detect_gaps(patient: PatientSummary, recommended_status: str) -> list[str]:
        gaps = []
        doc_texts = " ".join([d.get("description", "").lower() for d in patient.documents])

        # 1. Check for explicit physician inpatient admission order
        if (
            recommended_status == "inpatient"
            and "admit to inpatient" not in doc_texts
            and "inpatient stay" not in doc_texts
        ):
            gaps.append(
                "Missing explicit physician certification statement specifying expected inpatient cross-midnight duration"
            )

        # 2. Check for quantified treatment targets
        if (
            "heart failure" in str(patient.conditions).lower()
            and "urine output" not in doc_texts
            and "target weight" not in doc_texts
        ):
            gaps.append("Lack of quantified 24-hour urine output or dry weight goal in clinical progress notes")

        # 3. Check for baseline vs acute oxygen comparison in respiratory cases
        if "copd" in str(patient.conditions).lower() and "lpm" not in doc_texts and "liters" not in doc_texts:
            gaps.append(
                "Omission of baseline home oxygen flow rate (LPM) vs. acute escalation needs (critical for commercial appeal defense)"
            )

        # 4. Check for telemetry indication justification
        if "syncope" in str(patient.conditions).lower() and "orthostatic" not in doc_texts:
            gaps.append("Missing documentation of orthostatic vital signs or syncope risk stratification protocol")

        return gaps
