import time
from typing import Any

from backend.app.llm.adapter import BaseLLMAdapter
from backend.app.llm.models import CostCalculator, NarrativeResponse


class MockLLMAdapter(BaseLLMAdapter):
    """Deterministic, zero-latency clinical narrative generator for CI and offline demos."""

    async def generate_narrative(
        self,
        patient_summary: dict[str, Any],
        ur_decision: dict[str, Any],
        target_payer: str = "Medicare Advantage / Commercial",
        correlation_id: str = "",
    ) -> NarrativeResponse:
        start_time = time.time()
        pid = patient_summary.get("id", "synthetic-pt-001")
        name = patient_summary.get("full_name", "Patient")

        if "001" in pid:
            narrative = (
                f"APPEAL & MEDICAL NECESSITY JUSTIFICATION for {name}:\n\n"
                f"The patient presented with acute decompensated systolic heart failure with severe pulmonary congestion, "
                f"marked hypoxemia (SpO2 88% on room air), and significantly elevated NT-proBNP (7,840 pg/mL). Continuous IV loop diuretic "
                f"infusion titration and continuous cardiac telemetry monitoring were initiated. Given the hemodynamic instability "
                f"and required intensity of inpatient services extending across at least two consecutive midnights, inpatient admission "
                f"is medically necessary and satisfies the CMS 2-Midnight Benchmark (42 CFR 412.3) and MCG M-190 criteria."
            )
            cited = [
                "CMS 2-Midnight Rule (42 CFR 412.3)",
                "MCG Care Guidelines: Heart Failure (M-190)",
                "AHA/ACC Heart Failure Inpatient Criteria",
            ]
            rationale = "Severity of illness and intensity of IV therapy necessitate inpatient level of care."
        elif "002" in pid:
            narrative = (
                f"UTILIZATION REVIEW CLINICAL SUMMARY for {name}:\n\n"
                f"The patient was evaluated following an isolated syncopal episode. Serial cardiac troponins remained negative (0.01 ng/mL) "
                f"with normal electrocardiogram and preserved hemodynamic stability. Continuous telemetry and orthostatic monitoring "
                f"are indicated for a 12-24 hour window. Current clinical findings align with Observation status under CMS guidelines, "
                f"with potential conversion to inpatient only if cardiac arrhythmia or recurrent syncope occurs."
            )
            cited = [
                "CMS Observation Services Policy (Medicare Benefit Policy Manual Ch. 6 §20.6)",
                "InterQual: Syncope Observation Criteria",
            ]
            rationale = "Hemodynamically stable with negative cardiac biomarkers; appropriate for observation."
        else:
            narrative = (
                f"MEDICAL NECESSITY APPEAL JUSTIFICATION for {name}:\n\n"
                f"The patient presented with acute exacerbation of chronic obstructive pulmonary disease (COPD) complicated by "
                f"acute hypercapnic respiratory failure (PaCO2 54 mmHg) requiring immediate non-invasive positive pressure ventilation (BiPAP) "
                f"and IV corticosteroid therapy. Although home baseline oxygen documentation was initially omitted, the acute respiratory "
                f"decompensation and continuous BiPAP titration clearly satisfy inpatient admission criteria under 42 CFR 412.3."
            )
            cited = [
                "CMS 2-Midnight Benchmark (42 CFR 412.3)",
                "GOLD COPD Guidelines: Acute Inpatient Management",
                "MCG M-325: Chronic Obstructive Pulmonary Disease",
            ]
            rationale = "Severe respiratory distress with acute hypercapnia requiring BiPAP justifies inpatient stay."

        prompt_tokens = 1180
        completion_tokens = 340
        cost = CostCalculator.calculate_cost("gemini-2.5-flash", prompt_tokens, completion_tokens)
        latency = round((time.time() - start_time) * 1000, 2)

        return NarrativeResponse(
            patient_id=pid,
            narrative_text=narrative,
            criteria_cited=cited,
            clinical_rationale=rationale,
            model_used="Deterministic Clinical Template",
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            estimated_cost_usd=cost,
            latency_ms=latency,
            correlation_id=correlation_id,
        )
