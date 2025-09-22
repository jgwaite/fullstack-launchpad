from __future__ import annotations

from fastapi import APIRouter

from app.modules.system.router import router as system_router
from app.modules.todos.router import router as todo_router

api_router = APIRouter(prefix="/api")
api_router.include_router(system_router)
api_router.include_router(todo_router)

__all__ = ["api_router"]
