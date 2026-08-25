from typing import ClassVar

from pydantic import BaseModel, Field


class NarrativeRequest(BaseModel):
    patient_id: str
    target_payer: str | None = "Medicare Advantage / Commercial"
    include_gap_remediation: bool | None = True
    custom_context: str | None = None


class NarrativeResponse(BaseModel):
    patient_id: str
    narrative_text: str
    criteria_cited: list[str] = Field(default_factory=list)
    clinical_rationale: str | None = None
    model_used: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    estimated_cost_usd: float = 0.0
    latency_ms: float = 0.0
    disclaimer: str = "AI-generated decision support — requires human physician review before submission."
    correlation_id: str = ""


class CostCalculator:
    """Calculates granular FinOps token costs for supported models."""

    PRICING_PER_1M_TOKENS: ClassVar[dict[str, dict[str, float]]] = {
        # Gemini 2.5 Flash on Vertex AI ($0.075/1M input, $0.30/1M output)
        "gemini-2.5-flash": {"input": 0.075, "output": 0.30},
        "gemini-2.0-flash": {"input": 0.075, "output": 0.30},
        "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
        # Ollama local models are completely free
        "ollama-gemma": {"input": 0.0, "output": 0.0},
        "mock-llm": {"input": 0.0, "output": 0.0},
    }

    @classmethod
    def calculate_cost(cls, model_name: str, prompt_tokens: int, completion_tokens: int) -> float:
        pricing = cls.PRICING_PER_1M_TOKENS.get(model_name.lower(), {"input": 0.075, "output": 0.30})
        input_cost = (prompt_tokens / 1_000_000.0) * pricing["input"]
        output_cost = (completion_tokens / 1_000_000.0) * pricing["output"]
        return round(input_cost + output_cost, 6)
