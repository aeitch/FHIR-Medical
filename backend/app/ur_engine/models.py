from pydantic import BaseModel, Field


class UREvaluationRequest(BaseModel):
    patient_id: str
    server: str | None = None
    expected_stay_hours: int | None = 48
    clinical_notes: str | None = None


class UREvaluationResponse(BaseModel):
    patient_id: str
    recommended_status: str  # "inpatient" | "observation"
    confidence_score: float
    two_midnight_met: bool
    severity_of_illness: str  # "low" | "moderate" | "high"
    intensity_of_service: str  # "low" | "moderate" | "high"
    criteria_met: list[str] = Field(default_factory=list)
    documentation_gaps: list[str] = Field(default_factory=list)
    evaluation_summary: str
