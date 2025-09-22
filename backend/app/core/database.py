from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session

from .settings import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, class_=Session, autoflush=False, autocommit=False)


def get_session() -> Generator[Session, None, None]:
    """Yield a SQLModel session for request-scoped usage."""

    session: Session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
