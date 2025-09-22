"""Domain modules for the Launchpad backend."""


def load_all_modules() -> None:
    """Import modules with SQLModel metadata to register tables."""

    # Import domain modules to ensure SQLModel metadata is attached
    from app.modules.todos import models as todo_models  # noqa: F401


__all__ = ["load_all_modules"]
