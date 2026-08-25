import os
import httpx
from typing import List, Dict, Any, Optional
from backend.app.fhir.adapter import BaseFHIRAdapter
from backend.app.fhir.models import PatientSummary

class GCPHealthcareFHIRAdapter(BaseFHIRAdapter):
    """Adapter for Google Cloud Healthcare API FHIR R4 Store."""

    def __init__(
        self,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
        dataset_id: Optional[str] = None,
        fhir_store_id: Optional[str] = None,
    ):
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID", "platinum-factor-489721-f0")
        self.location = location or os.getenv("GCP_LOCATION", "us-central1")
        self.dataset_id = dataset_id or os.getenv("GCP_DATASET_ID", "clinefficiency_ur_dataset")
        self.fhir_store_id = fhir_store_id or os.getenv("GCP_FHIR_STORE_ID", "clinefficiency_fhir_store")
        self.base_url = (
            f"https://healthcare.googleapis.com/v1/projects/{self.project_id}/"
            f"locations/{self.location}/datasets/{self.dataset_id}/fhirStores/{self.fhir_store_id}/fhir"
        )

    def _get_auth_header(self) -> Dict[str, str]:
        # In Cloud Run or GCP environment, ADC automatically provides auth token
        token = os.getenv("GCP_ACCESS_TOKEN", "")
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/fhir+json"} if token else {}

    async def list_patients(self) -> List[Dict[str, Any]]:
        headers = self._get_auth_header()
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{self.base_url}/Patient", headers=headers, timeout=10.0)
                if resp.status_code == 200:
                    bundle = resp.json()
                    results = []
                    for entry in bundle.get("entry", []):
                        p = entry.get("resource", {})
                        names = p.get("name", [{}])
                        results.append({
                            "id": p.get("id"),
                            "name": f"{' '.join(names[0].get('given', []))} {names[0].get('family', '')}".strip(),
                            "gender": p.get("gender"),
                            "birthDate": p.get("birthDate"),
                            "scenario": "Live GCP Healthcare API Managed Store Patient"
                        })
                    return results
            except Exception:
                pass
        return []

    async def get_patient_summary(self, patient_id: str) -> Optional[PatientSummary]:
        headers = self._get_auth_header()
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{self.base_url}/Patient/{patient_id}/$everything", headers=headers, timeout=15.0)
                if resp.status_code == 200:
                    bundle = resp.json()
                    from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
                    return LocalFixtureFHIRAdapter()._extract_summary(bundle)
            except Exception:
                pass
        return None

    async def get_raw_bundle(self, patient_id: str) -> Optional[Dict[str, Any]]:
        headers = self._get_auth_header()
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{self.base_url}/Patient/{patient_id}/$everything", headers=headers, timeout=15.0)
                if resp.status_code == 200:
                    return resp.json()
            except Exception:
                pass
        return None
