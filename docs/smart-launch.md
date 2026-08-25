# SMART on FHIR 2.0 Integration & Public Sandbox Launch

The ClinEfficiency UR Console implements the **SMART App Launch Framework (HL7 FHIR R4)**, allowing clinical utilization review workflows to launch seamlessly within EHR systems (Epic, Oracle Health, Cerner) via standard OAuth2/OIDC protocols.

---

## 1. SMART App Launch Architecture

```
┌─────────────┐               ┌────────────────────────┐               ┌────────────────────────┐
│  EHR User   │ ──(1) Launch──►  ClinEfficiency Console │ ──(2) AuthReq─►│   EHR Auth Server /    │
│  (Session)  │               │     (FastAPI/React)    │               │ SMART on FHIR Sandbox  │
└─────────────┘               └───────────┬────────────┘               └───────────┬────────────┘
                                          │                                        │
                                          │◄───────(3) Auth Code / Token───────────┘
                                          │
                                          ▼ (4) Fetch Patient FHIR Bundle (patient/*.read)
                              ┌────────────────────────┐
                              │  FHIR R4 API Endpoint  │
                              └────────────────────────┘
```

---

## 2. OAuth2 Scopes & Parameters

| Parameter | Value / Description |
| :--- | :--- |
| **Response Type** | `code` (Authorization Code Flow with PKCE) |
| **Client ID** | Configured per EHR client registration |
| **Redirect URI** | `https://[CONSOLE_URL]/smart/callback` |
| **Requested Scopes** | `launch/patient openid fhirUser patient/Patient.read patient/Encounter.read patient/Condition.read patient/Observation.read patient/DocumentReference.read` |

---

## 3. Public Sandbox Testing

The UR Console is pre-configured to launch against standard public sandbox environments:

1. **SMART Health IT Public Launcher**:
   - Launch URL: `https://launch.smarthealthit.org/`
   - FHIR Version: `R4`
   - Simulated Patient IDs: Select standard cardiac or pulmonary admission profiles.

2. **Epic on FHIR Open Sandbox**:
   - Endpoint: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/`
   - Authentication: Epic open test credentials.
