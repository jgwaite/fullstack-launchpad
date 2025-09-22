from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class HealthCheck(BaseModel):
    status: Literal["ok"] = "ok"
