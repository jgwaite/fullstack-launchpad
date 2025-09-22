from __future__ import annotations

import logging

from .settings import Settings


def configure_logging(settings: Settings) -> None:
    """Apply the service logging configuration."""

    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logging.basicConfig(level=level)
