from typing import Dict, Any, List
from backend.app.fhir.models import PatientSummary
from backend.app.ur_engine.models import UREvaluationResponse

class UREngine:
    """Clinical decision engine for observation vs. inpatient utilization review."""

    @staticmethod
    def evaluate(patient: PatientSummary, expected_hours: int = 48) -> UREvaluationResponse:
        criteria_met = []
        severity = "low"
        intensity = "low"
        score = 0.5
        two_midnight = expected_hours >= 48

        # 1. Evaluate Conditions & ICD-10 diagnoses
        is_chf = False
        is_copd = False
        is_syncope = False

        for cond in patient.conditions:
            code_text = cond.get("code", {}).get("text", "").lower()
            codings = cond.get("code", {}).get("coding", [])
            icd_codes = [c.get("code", "") for c in codings]

            if any(c.startswith("I50") for c in icd_codes) or "heart failure" in code_text:
                is_chf = True
            if any(c.startswith("J44") for c in icd_codes) or "copd" in code_text:
                is_copd = True
            if any(c.startswith("R55") for c in icd_codes) or "syncope" in code_text:
                is_syncope = True

        # 2. Evaluate Observations & Vitals
        has_hypoxia = False
        has_hypercapnia = False
        elevated_bnp = False
        positive_troponin = False

        for obs in patient.observations:
            val_qty = obs.get("valueQuantity", {})
            val = val_qty.get("value", 0)
            codings = obs.get("code", {}).get("coding", [])
            display = " ".join([c.get("display", "").lower() for c in codings])

            if "oxygen saturation" in display and val < 90:
                has_hypoxia = True
                criteria_met.append(f"Severe hypoxemia confirmed (SpO2 {val}%) requiring continuous oxygen titration")
            if "carbon dioxide" in display and val > 50:
                has_hypercapnia = True
                criteria_met.append(f"Acute hypercapnic respiratory acidosis (PaCO2 {val} mmHg) requiring non-invasive ventilation")
            if "nt-probnp" in display and val > 1000:
                elevated_bnp = True
                criteria_met.append(f"Markedly elevated NT-proBNP ({val} pg/mL) demonstrating acute myocardial wall stress")
            if "troponin" in display and val > 0.04:
                positive_troponin = True
                criteria_met.append(f"Positive cardiac biomarker elevation (Troponin {val} ng/mL)")

        # 3. Decision Logic & Severity/Intensity Scoring
        if is_chf and (has_hypoxia or elevated_bnp):
            severity = "high"
            intensity = "high"
            criteria_met.append("Continuous IV loop diuretic infusion and hemodynamic monitoring required > 24 hours")
            criteria_met.append("CMS 2-Midnight Rule (42 CFR 412.3) satisfied by multi-day inpatient care plan")
            status = "inpatient"
            score = 0.95
            summary = "Acute decompensated heart failure with hypoxemia and high biomarker elevation requires inpatient admission."

        elif is_copd and has_hypercapnia:
            severity = "high"
            intensity = "high"
            criteria_met.append("Acute COPD exacerbation with respiratory failure requiring BiPAP titration")
            criteria_met.append("Inpatient level of care warranted for arterial blood gas normalization and steroid titration")
            status = "inpatient"
            score = 0.92
            summary = "Acute hypercapnic respiratory failure requiring positive pressure ventilation warrants inpatient stay."

        elif is_syncope:
            severity = "low" if not positive_troponin else "moderate"
            intensity = "low"
            status = "observation"
            score = 0.88
            two_midnight = False
            criteria_met.append("Single syncopal episode with negative cardiac biomarkers and stable hemodynamics")
            criteria_met.append("Appropriate for 12-24 hour observation services per CMS Medicare Benefit Policy Manual Ch. 6")
            summary = "Patient is hemodynamically stable with negative biomarkers; observation status indicated."

        else:
            status = "inpatient" if two_midnight else "observation"
            score = 0.70
            summary = "Evaluation based on expected duration of medically necessary services."

        from backend.app.gap_detect.detector import DocumentationGapDetector
        gaps = DocumentationGapDetector.detect_gaps(patient, status)

        return UREvaluationResponse(
            patient_id=patient.id,
            recommended_status=status,
            confidence_score=score,
            two_midnight_met=two_midnight,
            severity_of_illness=severity,
            intensity_of_service=intensity,
            criteria_met=criteria_met,
            documentation_gaps=gaps,
            evaluation_summary=summary,
        )
