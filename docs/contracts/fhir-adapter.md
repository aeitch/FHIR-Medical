# FHIR R4 Repository Adapter Contract

The FHIR adapter provides an abstract repository layer for retrieving synthetic patient data, decoupling application services from the underlying FHIR store (GCP Cloud Healthcare API, containerized HAPI FHIR, or local mock fixtures).

## Interface Definition (Python Protocol)

```python
from typing import Protocol, List, Dict, Any, Optional

class FHIRRepositoryProtocol(Protocol):
    async def get_patient(self, patient_id: str) -> Dict[str, Any]:
        """Fetch Patient resource by ID."""
        ...

    async def get_encounters(self, patient_id: str) -> List[Dict[str, Any]]:
        """Fetch Encounter resources associated with patient."""
        ...

    async def get_conditions(self, patient_id: str) -> List[Dict[str, Any]]:
        """Fetch Condition (diagnosis/problem list) resources."""
        ...

    async def get_observations(self, patient_id: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch Observation resources (vitals, labs)."""
        ...

    async def get_procedures(self, patient_id: str) -> List[Dict[str, Any]]:
        """Fetch Procedure resources."""
        ...

    async def get_documents(self, patient_id: str) -> List[Dict[str, Any]]:
        """Fetch DocumentReference resources (clinical notes)."""
        ...

    async def get_full_patient_bundle(self, patient_id: str) -> Dict[str, Any]:
        """Fetch all resources aggregated as a FHIR Bundle."""
        ...
```

## Standard R4 Resource Requirements
1. **Patient**: `identifier`, `name`, `gender`, `birthDate`, `telecom`
2. **Encounter**: `status`, `class`, `type`, `subject`, `period`, `reasonCode`
3. **Condition**: `clinicalStatus`, `verificationStatus`, `category`, `code`, `subject`, `onsetDateTime`
4. **Observation**: `status`, `category`, `code`, `subject`, `effectiveDateTime`, `valueQuantity`, `referenceRange`
5. **DocumentReference**: `status`, `type`, `subject`, `date`, `content` (base64 or text)

## Implementation Providers
- **`GCPHealthcareFHIRAdapter`**: Direct REST calls with OAuth2 bearer token to Google Cloud Healthcare API FHIR R4 store (`projects/{proj}/locations/{loc}/datasets/{ds}/fhirStores/{store}/fhir`).
- **`HAPIFHIRAdapter`**: REST calls to standard HAPI FHIR server.
- **`LocalFixtureFHIRAdapter`**: Zero-dependency local adapter loading JSON bundles from `seed/` for offline and test runs.
