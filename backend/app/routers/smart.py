import logging
import os

from backend.app.audit.logger import audit_logger
from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse

logger = logging.getLogger("ur_console.smart")
router = APIRouter(tags=["SMART on FHIR OAuth2"])

EPIC_SANDBOX_AUTH_URL = "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize"
EPIC_SANDBOX_TOKEN_URL = "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token"


@router.get("/callback", response_class=HTMLResponse)
async def smart_oauth_callback(
    request: Request,
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
    error_description: str = Query(None),
):
    """OAuth2 SMART on FHIR callback endpoint for Epic on FHIR."""
    corr_id = getattr(request.state, "correlation_id", "local")

    if error:
        logger.warning("SMART on FHIR OAuth error: %s (%s)", error, error_description)
        await audit_logger.log_event(
            action="SMART_OAUTH_FAILED",
            correlation_id=corr_id,
            details={"error": error, "description": error_description},
        )
        return HTMLResponse(
            content=f"""
            <html>
                <body style="font-family: system-ui; padding: 2rem; background: #f8fafc; color: #0f172a;">
                    <div style="max-width: 500px; margin: 0 auto; background: white; padding: 2rem; border-radius: 1rem; border: 1px solid #e2e8f0;">
                        <h2 style="color: #e11d48; margin-top: 0;">SMART on FHIR Authorization Error</h2>
                        <p style="font-size: 0.875rem; color: #64748b;">{error_description or error}</p>
                        <a href="/" style="display: inline-block; margin-top: 1rem; font-size: 0.875rem; color: #0d9488; font-weight: bold;">Return to UR Console</a>
                    </div>
                </body>
            </html>
            """,
            status_code=400,
        )

    await audit_logger.log_event(
        action="SMART_OAUTH_CALLBACK_RECEIVED",
        correlation_id=corr_id,
        details={"code_received": bool(code), "state": state},
    )

    return HTMLResponse(
        content="""
        <html>
            <head>
                <title>SMART on FHIR Connected</title>
                <meta http-equiv="refresh" content="2; url=/" />
            </head>
            <body style="font-family: system-ui; padding: 2rem; background: #f8fafc; color: #0f172a; text-align: center;">
                <div style="max-width: 500px; margin: 4rem auto; background: white; padding: 2.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                    <div style="font-size: 2rem; color: #0d9488; margin-bottom: 0.5rem;">✓</div>
                    <h2 style="color: #0f172a; margin: 0 0 0.5rem 0;">Epic on FHIR Connected</h2>
                    <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 1.5rem;">Authorization code successfully captured. Redirecting to ClinEfficiency UR Console...</p>
                    <a href="/" style="font-size: 0.875rem; color: #0d9488; font-weight: bold; text-decoration: none; background: #f0fdfa; padding: 0.5rem 1rem; border-radius: 0.5rem;">Go to Console Now</a>
                </div>
            </body>
        </html>
        """,
        status_code=200,
    )


@router.get("/smart/launch")
async def smart_launch(
    request: Request,
    iss: str = Query("https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"),
    launch: str = Query(None),
):
    """Initiates the SMART App Launch flow against Epic on FHIR sandbox."""
    client_id = os.getenv("EPIC_CLIENT_ID", "a615c68f-2250-4840-89fc-09f1972dc265")
    redirect_uri = os.getenv(
        "SMART_REDIRECT_URI", "https://clinefficiency-backend-256461781819.us-central1.run.app/callback"
    )
    scope = "launch/patient openid fhirUser patient/Patient.read patient/Encounter.read patient/Condition.read patient/Observation.read patient/DocumentReference.read"

    auth_url = (
        f"{EPIC_SANDBOX_AUTH_URL}?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}&"
        f"aud={iss}"
    )
    if launch:
        auth_url += f"&launch={launch}"

    return RedirectResponse(url=auth_url)
