import os
from enum import Enum
from backend.app.fhir.adapter import BaseFHIRAdapter
from backend.app.fhir.epic_adapter import EpicFHIRAdapter
from backend.app.fhir.gcp_healthcare_adapter import GCPHealthcareFHIRAdapter
from backend.app.fhir.local_adapter import LocalFixtureFHIRAdapter
from backend.app.fhir.smart_hapi_adapter import SmartHapiFHIRAdapter


class FHIRServerType(str, Enum):
    EPIC = "epic"
    SMART = "smart"
    HAPI = "hapi"
    GCP_HEALTHCARE = "gcp_healthcare"
    LOCAL = "local"


FHIR_SERVER_REGISTRY = {
    FHIRServerType.EPIC: {
        "name": "Epic on FHIR Open Sandbox",
        "base_url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/",
        "auth_type": "oauth_smart",
        "sample_ids": ["erXuFYUfucBZaryVpgxafgw3", "eq081-VQEgP8FsSTUDALVUQ3", "egqBHVfQCU3FAoDRSmkeKzg3"],
    },
    FHIRServerType.SMART: {
        "name": "SMART Health IT Public R4",
        "base_url": "https://r4.smarthealthit.org/",
        "auth_type": "open",
        "sample_ids": ["d4fb3bba-73a9-4b82-a0bc-678d47f386b4", "d48ac962-78c6-46cf-ba33-a24771bfa0e4"],
    },
    FHIRServerType.HAPI: {
        "name": "HAPI FHIR Public R4",
        "base_url": "https://hapi.fhir.org/baseR4/",
        "auth_type": "open",
        "sample_ids": ["sindhu-syn-000004", "131109"],
    },
    FHIRServerType.LOCAL: {
        "name": "Local Synthea Seed Store",
        "base_url": "local://seed",
        "auth_type": "local",
        "sample_ids": ["synthetic-pt-001", "synthetic-pt-002", "synthetic-pt-003"],
    },
}


def get_fhir_adapter(server_override: str | None = None) -> BaseFHIRAdapter:
    """Returns the appropriate BaseFHIRAdapter based on requested server or environment configuration."""
    raw_server = (server_override or os.getenv("FHIR_PROVIDER") or os.getenv("FHIR_SERVER") or "epic").lower().strip()

    if raw_server in ["smart", "smarthealthit", "smart_public"]:
        base_url = os.getenv("FHIR_BASE_URL", FHIR_SERVER_REGISTRY[FHIRServerType.SMART]["base_url"])
        return SmartHapiFHIRAdapter(base_url=base_url, server_name="SMART Health IT")

    if raw_server in ["hapi", "hapi_public"]:
        base_url = os.getenv("FHIR_BASE_URL", FHIR_SERVER_REGISTRY[FHIRServerType.HAPI]["base_url"])
        return SmartHapiFHIRAdapter(base_url=base_url, server_name="HAPI FHIR")

    if raw_server in ["gcp", "gcp_healthcare"]:
        return GCPHealthcareFHIRAdapter()

    if raw_server in ["local", "seed", "offline"]:
        return LocalFixtureFHIRAdapter()

    # Default to Epic on FHIR Sandbox Adapter
    base_url = os.getenv("FHIR_BASE_URL", FHIR_SERVER_REGISTRY[FHIRServerType.EPIC]["base_url"])
    return EpicFHIRAdapter(base_url=base_url)
