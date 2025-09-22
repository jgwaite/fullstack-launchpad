from __future__ import annotations

from fastapi import APIRouter

from .schemas import HealthCheck

router = APIRouter(tags=["system"])


@router.get("/healthz", response_model=HealthCheck, summary="Service health check")
async def healthz() -> HealthCheck:
    return HealthCheck()
