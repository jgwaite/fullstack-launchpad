from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from .models import TodoStatus


class TodoTagRead(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class TodoItemBase(BaseModel):
    title: str
    description: str | None = None
    notes: str | None = None
    due_date: datetime | None = None
    status: TodoStatus = Field(default=TodoStatus.todo)
    position: int | None = None
    tags: list[str] | None = None


class TodoItemCreate(TodoItemBase):
    title: str


class TodoItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    notes: str | None = None
    due_date: datetime | None = None
    status: TodoStatus | None = None
    position: int | None = None
    tags: list[str] | None = None


class TodoItemRead(BaseModel):
    id: UUID
    list_id: UUID
    title: str
    description: str | None
    notes: str | None
    due_date: datetime | None
    status: TodoStatus
    position: int
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    tags: list[TodoTagRead]

    model_config = ConfigDict(from_attributes=True)


class TodoListBase(BaseModel):
    name: str
    description: str | None = None


class TodoListCreate(TodoListBase):
    name: str


class TodoListUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class TodoListRead(BaseModel):
    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TodoListSummary(TodoListRead):
    item_count: int = 0


class TodoListDetail(TodoListRead):
    items: list[TodoItemRead] = Field(default_factory=list)
