from abc import ABC, abstractmethod
from typing import Any

from backend.app.fhir.models import PatientSummary


class BaseFHIRAdapter(ABC):
    """Abstract base class for FHIR R4 repository adapters."""

    @abstractmethod
    async def list_patients(self) -> list[dict[str, Any]]:
        """List summary of all available synthetic patients."""

    @abstractmethod
    async def get_patient_summary(self, patient_id: str) -> PatientSummary | None:
        """Get consolidated clinical summary for a patient."""

    @abstractmethod
    async def get_raw_bundle(self, patient_id: str) -> dict[str, Any] | None:
        """Get raw FHIR R4 JSON bundle."""
