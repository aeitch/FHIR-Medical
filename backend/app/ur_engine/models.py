from typing import List, Optional
from pydantic import BaseModel, Field

class UREvaluationRequest(BaseModel):
    patient_id: str
    expected_stay_hours: Optional[int] = 48
    clinical_notes: Optional[str] = None

class UREvaluationResponse(BaseModel):
    patient_id: str
    recommended_status: str  # "inpatient" | "observation"
    confidence_score: float
    two_midnight_met: bool
    severity_of_illness: str  # "low" | "moderate" | "high"
    intensity_of_service: str  # "low" | "moderate" | "high"
    criteria_met: List[str] = Field(default_factory=list)
    documentation_gaps: List[str] = Field(default_factory=list)
    evaluation_summary: str
