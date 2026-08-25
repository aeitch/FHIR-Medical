import json
from pathlib import Path
from typing import Dict, Any, List

class PromptManager:
    """Manages versioned clinical prompt templates for utilization review narrative generation."""

    def __init__(self, prompts_dir: str = None):
        if prompts_dir:
            self.prompts_dir = Path(prompts_dir)
        else:
            self.prompts_dir = Path(__file__).resolve().parent

    def get_system_prompt(self, version: str = "v1") -> str:
        prompt_file = self.prompts_dir / f"physician_advisor_{version}.txt"
        if prompt_file.exists():
            return prompt_file.read_text(encoding="utf-8")
        return (
            "You are a Physician Advisor assisting with clinical utilization review. "
            "Generate structured JSON with medical necessity narrative."
        )

    def format_user_prompt(
        self,
        patient_summary: Dict[str, Any],
        ur_decision: Dict[str, Any],
        target_payer: str = "Medicare Advantage / Commercial",
    ) -> str:
        return f"""
PATIENT CHART SUMMARY (SYNTHETIC DATA):
- Name: {patient_summary.get('full_name')}
- Age/Gender: {patient_summary.get('age')}yo {patient_summary.get('gender')}
- Diagnosis: {', '.join([c.get('code', {}).get('text', 'Unspecified') for c in patient_summary.get('conditions', [])])}
- Key Observations: {json.dumps(patient_summary.get('observations', []))}
- Active Encounter: {json.dumps(patient_summary.get('active_encounter', {}))}

UR ENGINE RECOMMENDATION:
- Status: {ur_decision.get('recommended_status', 'inpatient').upper()}
- Severity of Illness: {ur_decision.get('severity_of_illness', 'high')}
- Intensity of Service: {ur_decision.get('intensity_of_service', 'high')}
- Criteria Met: {json.dumps(ur_decision.get('criteria_met', []))}
- Documentation Gaps: {json.dumps(ur_decision.get('documentation_gaps', []))}

TARGET PAYER: {target_payer}

Draft the comprehensive appeal/justification JSON now:
"""
