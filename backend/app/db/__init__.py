"""Database shortcuts maintained for Alembic compatibility."""

from app.core.database import SessionLocal, engine, get_session  # noqa: F401

# Import models so SQLModel metadata is registered when Alembic runs.
from . import models  # noqa: F401,E402

__all__ = ["engine", "SessionLocal", "get_session"]
