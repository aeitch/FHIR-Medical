FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

RUN pip install --no-cache-dir uv

COPY pyproject.toml /app/
RUN uv venv /app/.venv && \
    . /app/.venv/bin/activate && \
    uv pip install --no-cache-dir -e .

COPY app/ /app/backend/app/
COPY seed/ /app/seed/
COPY seed/ /app/backend/seed/

EXPOSE 8080

CMD ["/app/.venv/bin/python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8080"]
