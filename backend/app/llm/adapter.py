from abc import ABC, abstractmethod
from typing import Any

from backend.app.llm.models import NarrativeResponse


class BaseLLMAdapter(ABC):
    """Abstract interface for medical necessity narrative generation providers."""

    @abstractmethod
    async def generate_narrative(
        self,
        patient_summary: dict[str, Any],
        ur_decision: dict[str, Any],
        target_payer: str = "Medicare Advantage / Commercial",
        correlation_id: str = "",
    ) -> NarrativeResponse:
        """Generate structured clinical appeal narrative."""
