# ClinEfficiency UR Console — Backend API

FastAPI backend providing FHIR R4 repository adapters (Epic on FHIR sandbox, GCP Healthcare API), clinical Utilization Review decision engine (CMS 2-Midnight Rule), documentation gap detection, and Vertex AI narrative synthesis.

## Quickstart

```bash
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
pytest -v
python -m uvicorn backend.app.main:app --port 8000 --reload
```
