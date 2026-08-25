import logging
from datetime import UTC, datetime
from typing import Any

import httpx
from backend.app.fhir.adapter import BaseFHIRAdapter
from backend.app.fhir.models import PatientSummary

logger = logging.getLogger("ur_console.fhir.smart_hapi")


class SmartHapiFHIRAdapter(BaseFHIRAdapter):
    """Adapter for Open Public FHIR R4 Servers (SMART Health IT & HAPI FHIR)."""

    def __init__(self, base_url: str, server_name: str = "SMART Health IT"):
        self.base_url = base_url.rstrip("/")
        self.server_name = server_name

    def _calculate_age(self, birth_date_str: str | None) -> int:
        if not birth_date_str:
            return 65
        try:
            birth_date = datetime.strptime(birth_date_str[:10], "%Y-%m-%d").replace(tzinfo=UTC)
            today = datetime.now(UTC)
            return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        except Exception:
            return 65

    def _parse_patient_resource(self, p_res: dict[str, Any]) -> dict[str, Any]:
        pid = p_res.get("id", "unknown")
        names = p_res.get("name", [{}])
        given = " ".join(names[0].get("given", [])) if names else ""
        family = names[0].get("family", "") if names else ""
        text_name = names[0].get("text", "") if names else ""
        full_name = text_name or f"{given} {family}".strip() or f"{self.server_name} Patient"
        gender = p_res.get("gender", "unknown")
        birth_date = p_res.get("birthDate", "1960-01-01")
        age = self._calculate_age(birth_date)

        # Get MRN or construct from ID
        mrn = f"{self.server_name[:3].upper()}-{pid[:8].upper()}"
        for ident in p_res.get("identifier", []):
            if "mrn" in str(ident.get("system", "")).lower() or "mrn" in str(ident.get("type", "")).lower():
                mrn = ident.get("value", mrn)
                break

        return {
            "id": pid,
            "mrn": mrn,
            "name": full_name,
            "gender": gender,
            "birthDate": birth_date,
            "age": age,
            "scenario": f"{self.server_name} Live Patient ({full_name})",
            "encounter_class": "inpatient encounter",
            "provenance": f"{self.server_name} Public R4 (Live)",
        }

    async def list_patients(self) -> list[dict[str, Any]]:
        items, _ = await self.list_patients_paginated(page=1, page_size=20)
        return items

    async def list_patients_paginated(self, page: int = 1, page_size: int = 10) -> tuple[list[dict[str, Any]], int]:
        """Queries the live public FHIR server with pagination support."""
        headers = {"Accept": "application/json, application/fhir+json"}
        offset = (page - 1) * page_size
        url = f"{self.base_url}/Patient?_count={page_size}&_offset={offset}"

        patients = []
        total = 50

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(url, headers=headers, timeout=10.0)
                if resp.status_code == 200:
                    bundle = resp.json()
                    total = bundle.get("total") or 50
                    for entry in bundle.get("entry", []):
                        p_res = entry.get("resource", {})
                        if p_res.get("resourceType") == "Patient":
                            patients.append(self._parse_patient_resource(p_res))
            except Exception as e:
                logger.warning("Failed to query public FHIR server %s: %s", self.base_url, e)

        return patients, total

    async def get_patient_summary(self, patient_id: str) -> PatientSummary | None:
        """Fetches full clinical resource graph (Patient, Conditions, Observations, Encounters, Notes)."""
        headers = {"Accept": "application/json, application/fhir+json"}

        async with httpx.AsyncClient() as client:
            try:
                # 1. Fetch Patient
                p_resp = await client.get(f"{self.base_url}/Patient/{patient_id}", headers=headers, timeout=10.0)
                if p_resp.status_code != 200:
                    logger.info("Patient %s not found on %s (HTTP %s)", patient_id, self.base_url, p_resp.status_code)
                    return None

                p_data = p_resp.json()
                parsed_demo = self._parse_patient_resource(p_data)

                # 2. Fetch Conditions
                cond_resp = await client.get(
                    f"{self.base_url}/Condition?patient={patient_id}&_count=20", headers=headers, timeout=10.0
                )
                conditions = (
                    [e.get("resource", {}) for e in cond_resp.json().get("entry", [])]
                    if cond_resp.status_code == 200
                    else []
                )

                # 3. Fetch Observations (Labs & Vitals)
                obs_resp = await client.get(
                    f"{self.base_url}/Observation?patient={patient_id}&_count=20", headers=headers, timeout=10.0
                )
                observations = (
                    [e.get("resource", {}) for e in obs_resp.json().get("entry", [])]
                    if obs_resp.status_code == 200
                    else []
                )

                # 4. Fetch Encounters
                enc_resp = await client.get(
                    f"{self.base_url}/Encounter?patient={patient_id}&_count=5", headers=headers, timeout=10.0
                )
                encounters = (
                    [e.get("resource", {}) for e in enc_resp.json().get("entry", [])]
                    if enc_resp.status_code == 200
                    else []
                )
                active_enc = encounters[0] if encounters else None

                # 5. Fetch DocumentReference
                doc_resp = await client.get(
                    f"{self.base_url}/DocumentReference?patient={patient_id}&_count=5", headers=headers, timeout=10.0
                )
                documents = (
                    [e.get("resource", {}) for e in doc_resp.json().get("entry", [])]
                    if doc_resp.status_code == 200
                    else []
                )

                scenario_desc = (
                    f"Live {self.server_name} Record ({parsed_demo['name']}) with {len(conditions)} condition(s) and {len(observations)} observation(s)."
                )

                return PatientSummary(
                    id=patient_id,
                    mrn=parsed_demo["mrn"],
                    full_name=parsed_demo["name"],
                    gender=parsed_demo["gender"],
                    birth_date=parsed_demo["birthDate"],
                    age=parsed_demo["age"],
                    active_encounter=active_enc,
                    conditions=conditions,
                    observations=observations,
                    documents=documents,
                    scenario_description=scenario_desc,
                )
            except Exception as e:
                logger.error("Error fetching patient %s from %s: %s", patient_id, self.base_url, e)
                return None

    async def get_raw_bundle(self, patient_id: str) -> dict[str, Any] | None:
        """Retrieves raw bundle or constructs aggregation from public server."""
        headers = {"Accept": "application/json, application/fhir+json"}
        async with httpx.AsyncClient() as client:
            try:
                # Try $everything if supported
                resp = await client.get(
                    f"{self.base_url}/Patient/{patient_id}/$everything", headers=headers, timeout=10.0
                )
                if resp.status_code == 200:
                    return resp.json()

                # Fallback to direct Patient fetch
                p_resp = await client.get(f"{self.base_url}/Patient/{patient_id}", headers=headers, timeout=10.0)
                if p_resp.status_code == 200:
                    return {
                        "resourceType": "Bundle",
                        "type": "searchset",
                        "entry": [{"resource": p_resp.json()}],
                    }
            except Exception:
                pass
        return None
