# syntax=docker/dockerfile:1

FROM ghcr.io/astral-sh/uv:python3.13-bookworm AS builder

WORKDIR /app

COPY pyproject.toml uv.lock README.md alembic.ini /app/
RUN uv sync --frozen --no-dev --python 3.13
COPY app /app/app

FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# System dependencies for runtime health checks and psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app /app

EXPOSE 8000

# Production default; docker-compose.dev overrides to add --reload while keeping this image prod-ready.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
