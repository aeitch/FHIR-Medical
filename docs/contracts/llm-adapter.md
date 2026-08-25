# LLM Payer Narrative Adapter Contract

The LLM adapter generates payer-ready medical necessity appeals and justifications from structured patient chart data and UR engine recommendations.

## Interface Definition (Python Protocol)

```python
from typing import Protocol, List, Dict, Any, Optional
from pydantic import BaseModel

class NarrativeRequest(BaseModel):
    patient_id: str
    patient_summary: str
    ur_decision: str  # "inpatient" | "observation"
    criteria_met: List[str]
    documentation_gaps: List[str]
    target_payer: Optional[str] = "Medicare / Commercial"
    correlation_id: str

class NarrativeResponse(BaseModel):
    patient_id: str
    narrative_text: str
    criteria_cited: List[str]
    model_used: str
    prompt_tokens: int
    completion_tokens: int
    estimated_cost_usd: float
    disclaimer: str
    correlation_id: str

class LLMProviderProtocol(Protocol):
    async def generate_narrative(self, request: NarrativeRequest) -> NarrativeResponse:
        """Generates medical necessity narrative with strict JSON parsing."""
        ...
```

## Security & PHI Guardrails
1. **Zero PHI Rule**: All incoming clinical text is scanned against PHI regex patterns (SSN, real phone numbers, real MRNs). Any match is blocked and logged as a security event.
2. **Deterministic Citations**: Prompts strictly instruct the model to cite only facts present in the provided chart summary.
3. **Mandatory Disclaimer**: Every response includes:
   `"AI-generated decision support — requires human physician review before submission."`

## Implementation Providers
- **`VertexAIGeminiAdapter`**: Calls Vertex AI `gemini-2.5-flash` using Google GenAI SDK with ADC authentication.
- **`OllamaGemmaAdapter`**: Local fallback targeting `http://localhost:11434/v1` for $0 offline operation.
- **`MockLLMAdapter`**: Deterministic test adapter for unit and CI test suites.
