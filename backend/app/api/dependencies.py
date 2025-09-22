from __future__ import annotations

from collections.abc import Generator

from sqlmodel import Session

from app.core.database import get_session
from app.core.settings import Settings, get_settings


def get_settings_dependency() -> Settings:
    """Provide application settings to request handlers."""

    return get_settings()


def get_db_session() -> Generator[Session, None, None]:
    """Yield a SQLModel session for FastAPI dependency injection."""

    yield from get_session()
