import logging

from backend.app.audit.middleware import CorrelationIdMiddleware
from backend.app.routers import audit, fhir_metadata, health, narrative, patients, smart, ur
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s", "level":"%(levelname)s", "logger":"%(name)s", "message":"%(message)s"}',
)

app = FastAPI(
    title="ClinEfficiency Pro — UR Console API",
    description="Utilization Review Decision Engine & SMART on FHIR Appeal Generator on Google Cloud Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://app.aeitch.com",
    "https://backend.aeitch.com",
    "https://aeitch.com",
    "https://clinefficiency-frontend-256461781819.us-central1.run.app",
    "https://clinefficiency-frontend-ryrty7jjta-uc.a.run.app",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# End-to-End Tracing Middleware
app.add_middleware(CorrelationIdMiddleware)

# Root level routes (Liveness and SMART OAuth)
app.include_router(health.router)
app.include_router(smart.router)

# Versioned Routes: Mount under both /api and /api/v1
for prefix in ["/api", "/api/v1"]:
    app.include_router(health.router, prefix=prefix)
    app.include_router(patients.router, prefix=prefix)
    app.include_router(ur.router, prefix=prefix)
    app.include_router(narrative.router, prefix=prefix)
    app.include_router(audit.router, prefix=prefix)
    app.include_router(fhir_metadata.router, prefix=prefix)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
