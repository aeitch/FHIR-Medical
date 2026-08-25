from fastapi import APIRouter

router = APIRouter(prefix="/fhir", tags=["FHIR Conformance & Metadata"])


@router.get("/metadata")
async def get_capability_statement():
    """Returns official HL7 FHIR 4.0.1 CapabilityStatement for ClinEfficiency UR Console."""
    return {
        "resourceType": "CapabilityStatement",
        "id": "clinefficiency-ur-capability",
        "name": "ClinEfficiencyURConsoleCapabilityStatement",
        "title": "ClinEfficiency Pro UR Console FHIR Conformance Statement",
        "status": "active",
        "experimental": False,
        "date": "2026-08-25T00:00:00Z",
        "publisher": "ClinEfficiency Pro LLC",
        "contact": [
            {
                "name": "ClinEfficiency Clinical Informatics",
                "telecom": [{"system": "url", "value": "https://clinefficiency.demo"}],
            }
        ],
        "description": "Conformance statement for ClinEfficiency Pro Utilization Review (UR) and SMART on FHIR integration.",
        "kind": "capability",
        "software": {
            "name": "ClinEfficiency Pro UR Console",
            "version": "2.0.0",
            "releaseDate": "2026-08-25",
        },
        "implementation": {
            "description": "GCP Cloud Run Serverless HL7 FHIR R4 Microservices",
            "url": "https://clinefficiency-backend-256461781819.us-central1.run.app/api/fhir",
        },
        "fhirVersion": "4.0.1",
        "format": [
            "application/fhir+json",
            "application/json",
        ],
        "rest": [
            {
                "mode": "client",
                "documentation": "Consumes and evaluates standard HL7 FHIR R4 clinical data for utilization review.",
                "security": {
                    "cors": True,
                    "service": [
                        {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/restful-security-service",
                                    "code": "SMART-on-FHIR",
                                    "display": "SMART-on-FHIR",
                                }
                            ],
                            "text": "OAuth2 using SMART-on-FHIR profile",
                        }
                    ],
                },
                "resource": [
                    {
                        "type": "Patient",
                        "profile": "http://hl7.org/fhir/StructureDefinition/Patient",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "_id", "type": "token"}, {"name": "identifier", "type": "token"}],
                    },
                    {
                        "type": "Encounter",
                        "profile": "http://hl7.org/fhir/StructureDefinition/Encounter",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "patient", "type": "reference"}],
                    },
                    {
                        "type": "Condition",
                        "profile": "http://hl7.org/fhir/StructureDefinition/Condition",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [
                            {"name": "patient", "type": "reference"},
                            {"name": "clinical-status", "type": "token"},
                        ],
                    },
                    {
                        "type": "Observation",
                        "profile": "http://hl7.org/fhir/StructureDefinition/Observation",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [
                            {"name": "patient", "type": "reference"},
                            {"name": "category", "type": "token"},
                            {"name": "code", "type": "token"},
                        ],
                    },
                    {
                        "type": "DocumentReference",
                        "profile": "http://hl7.org/fhir/StructureDefinition/DocumentReference",
                        "interaction": [{"code": "read"}, {"code": "search-type"}],
                        "searchParam": [{"name": "patient", "type": "reference"}],
                    },
                ],
            }
        ],
    }
