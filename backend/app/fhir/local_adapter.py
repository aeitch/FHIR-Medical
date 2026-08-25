import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from backend.app.fhir.adapter import BaseFHIRAdapter
from backend.app.fhir.models import PatientSummary


class LocalFixtureFHIRAdapter(BaseFHIRAdapter):
    """Zero-dependency local adapter reading Synthea R4 bundles from disk."""

    def __init__(self, seed_dir: str | None = None):
        if seed_dir:
            self.seed_dir = Path(seed_dir)
        else:
            # Look relative to project root or package root
            base_path = Path(__file__).resolve().parent.parent.parent.parent
            self.seed_dir = base_path / "seed"

    def _load_bundle(self, file_path: Path) -> dict[str, Any] | None:
        if not file_path.exists():
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _calculate_age(self, birth_date_str: str) -> int:
        try:
            birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").replace(tzinfo=UTC)
            today = datetime.now(UTC)
            return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        except Exception:
            return 65

    def _extract_summary(self, bundle: dict[str, Any]) -> PatientSummary:
        entries = bundle.get("entry", [])
        patient_res = None
        encounters = []
        conditions = []
        observations = []
        documents = []

        for entry in entries:
            res = entry.get("resource", {})
            rtype = res.get("resourceType")
            if rtype == "Patient":
                patient_res = res
            elif rtype == "Encounter":
                encounters.append(res)
            elif rtype == "Condition":
                conditions.append(res)
            elif rtype == "Observation":
                observations.append(res)
            elif rtype == "DocumentReference":
                documents.append(res)

        pid = patient_res.get("id", "unknown") if patient_res else "unknown"
        names = patient_res.get("name", [{}]) if patient_res else [{}]
        given = " ".join(names[0].get("given", []))
        family = names[0].get("family", "")
        full_name = f"{given} {family}".strip() or "Anonymous Synthetic Patient"
        gender = patient_res.get("gender", "unknown") if patient_res else "unknown"
        birth_date = patient_res.get("birthDate", "1960-01-01") if patient_res else "1960-01-01"
        age = self._calculate_age(birth_date)

        mrn = "SYNTH-MRN-XXXX"
        if patient_res:
            for ident in patient_res.get("identifier", []):
                if "mrn" in ident.get("system", "").lower():
                    mrn = ident.get("value", mrn)

        active_enc = encounters[0] if encounters else None
        scenario = "Standard Synthetic Admission"
        if documents:
            scenario = documents[0].get("description", scenario)

        return PatientSummary(
            id=pid,
            mrn=mrn,
            full_name=full_name,
            gender=gender,
            birth_date=birth_date,
            age=age,
            active_encounter=active_enc,
            conditions=conditions,
            observations=observations,
            documents=documents,
            scenario_description=scenario,
        )

    async def list_patients(self) -> list[dict[str, Any]]:
        patients = []
        if not self.seed_dir.exists():
            return patients

        for file_path in sorted(self.seed_dir.glob("*.json")):
            bundle = self._load_bundle(file_path)
            if bundle:
                summary = self._extract_summary(bundle)
                patients.append(
                    {
                        "id": summary.id,
                        "mrn": summary.mrn,
                        "name": summary.full_name,
                        "gender": summary.gender,
                        "birthDate": summary.birth_date,
                        "age": summary.age,
                        "scenario": summary.scenario_description,
                        "encounter_class": summary.active_encounter.get("class", {}).get("display", "Inpatient")
                        if summary.active_encounter
                        else "Inpatient",
                        "provenance": "Offline Synthea Seed Store",
                    }
                )
        return patients

    async def list_patients_paginated(self, page: int = 1, page_size: int = 10) -> tuple[list[dict[str, Any]], int]:
        all_patients = await self.list_patients()
        total = len(all_patients)
        start = (page - 1) * page_size
        end = start + page_size
        return all_patients[start:end], total

    async def get_patient_summary(self, patient_id: str) -> PatientSummary | None:
        if not self.seed_dir.exists():
            return None

        for file_path in self.seed_dir.glob("*.json"):
            bundle = self._load_bundle(file_path)
            if bundle:
                summary = self._extract_summary(bundle)
                if summary.id == patient_id:
                    return summary
        return None

    async def get_raw_bundle(self, patient_id: str) -> dict[str, Any] | None:
        if not self.seed_dir.exists():
            return None

        for file_path in self.seed_dir.glob("*.json"):
            bundle = self._load_bundle(file_path)
            if bundle:
                summary = self._extract_summary(bundle)
                if summary.id == patient_id:
                    return bundle
        return None
