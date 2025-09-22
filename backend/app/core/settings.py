from __future__ import annotations

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        case_sensitive=False,
        extra="ignore",
    )

    project_name: str = "Launchpad Todo API"
    api_prefix: str = "/api"
    environment: str = Field(default="local", description="Deployment environment name")
    log_level: str = Field(default="INFO", description="Python logging level")
    database_url: str = Field(
        default="postgresql+psycopg://postgres:dev@localhost:5432/launchpad",
        description="SQLAlchemy connection string",
    )
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        description="Allowed CORS origins",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: list[str] | str) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance to reuse across the app."""

    return Settings()
