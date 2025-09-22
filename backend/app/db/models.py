"""Entrypoint for Alembic to discover SQLModel metadata."""

from __future__ import annotations

from sqlmodel import SQLModel

from app.modules import load_all_modules

load_all_modules()

__all__ = ["SQLModel"]
