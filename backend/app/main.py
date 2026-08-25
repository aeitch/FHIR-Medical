import logging

from backend.app.audit.middleware import CorrelationIdMiddleware
from backend.app.routers import audit, health, narrative, patients, ur
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# End-to-End Tracing Middleware
app.add_middleware(CorrelationIdMiddleware)

# Mount Routers
app.include_router(health.router)
app.include_router(patients.router, prefix="/api")
app.include_router(ur.router, prefix="/api")
app.include_router(narrative.router, prefix="/api")
app.include_router(audit.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
