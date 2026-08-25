from backend.app.fhir.adapter import BaseFHIRAdapter
from backend.app.fhir.epic_adapter import EpicFHIRAdapter
from backend.app.fhir.gcp_healthcare_adapter import GCPHealthcareFHIRAdapter
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.fhir.models import PatientSummary
from backend.app.fhir.registry import FHIR_SERVER_REGISTRY, FHIRServerType, get_fhir_adapter
from backend.app.fhir.smart_hapi_adapter import SmartHapiFHIRAdapter

__all__ = [
    "BaseFHIRAdapter",
    "EpicFHIRAdapter",
    "FHIR_SERVER_REGISTRY",
    "FHIRServerType",
    "GCPHealthcareFHIRAdapter",
    "LocalFixtureFHIRAdapter",
    "PatientSummary",
    "SmartHapiFHIRAdapter",
    "get_fhir_adapter",
]
