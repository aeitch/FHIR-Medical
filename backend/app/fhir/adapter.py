from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from backend.app.fhir.models import PatientSummary

class BaseFHIRAdapter(ABC):
    """Abstract base class for FHIR R4 repository adapters."""

    @abstractmethod
    async def list_patients(self) -> List[Dict[str, Any]]:
        """List summary of all available synthetic patients."""
        pass

    @abstractmethod
    async def get_patient_summary(self, patient_id: str) -> Optional[PatientSummary]:
        """Get consolidated clinical summary for a patient."""
        pass

    @abstractmethod
    async def get_raw_bundle(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Get raw FHIR R4 JSON bundle."""
        pass
