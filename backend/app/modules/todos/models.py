import uuid
from datetime import UTC, datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Column, DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy import Enum as SQLEnum
from sqlmodel import Field, Relationship, SQLModel


def _timestamp_column(*, onupdate: bool = False) -> Field:
    column_kwargs = {"server_default": func.now(), "nullable": False}
    if onupdate:
        column_kwargs["onupdate"] = func.now()
    return Field(
        default_factory=lambda: datetime.now(tz=UTC),
        sa_column=Column(DateTime(timezone=True), **column_kwargs),
    )


class TodoStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    blocked = "blocked"
    done = "done"


class TodoItemTagLink(SQLModel, table=True):
    __tablename__ = "todo_item_tags"

    item_id: uuid.UUID = Field(
        foreign_key="todo_items.id",
        primary_key=True,
    )
    tag_id: uuid.UUID = Field(
        foreign_key="todo_tags.id",
        primary_key=True,
    )


class TodoList(SQLModel, table=True):
    __tablename__ = "todo_lists"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(sa_column=Column(String(120), nullable=False))
    description: Optional[str] = Field(default=None, sa_column=Column(String(500), nullable=True))
    created_at: datetime = _timestamp_column()
    updated_at: datetime = _timestamp_column(onupdate=True)

    items: List["TodoItem"] = Relationship(
        back_populates="list",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class TodoTag(SQLModel, table=True):
    __tablename__ = "todo_tags"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(sa_column=Column(String(50), unique=True, nullable=False))
    created_at: datetime = _timestamp_column()
    updated_at: datetime = _timestamp_column(onupdate=True)

    items: List["TodoItem"] = Relationship(
        back_populates="tags",
        link_model=TodoItemTagLink,
    )


class TodoItem(SQLModel, table=True):
    __tablename__ = "todo_items"
    __table_args__ = (
        UniqueConstraint("list_id", "position", name="uq_todo_items_list_position"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    list_id: uuid.UUID = Field(foreign_key="todo_lists.id", nullable=False, index=True)
    title: str = Field(sa_column=Column(String(200), nullable=False))
    description: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    notes: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    status: TodoStatus = Field(
        default=TodoStatus.todo,
        sa_column=Column(SQLEnum(TodoStatus, name="todo_status", native_enum=False), nullable=False),
    )
    due_date: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True), nullable=True))
    completed_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True), nullable=True))
    position: int = Field(default=0, sa_column=Column(Integer, nullable=False, server_default="0"))
    created_at: datetime = _timestamp_column()
    updated_at: datetime = _timestamp_column(onupdate=True)

    list: Optional["TodoList"] = Relationship(back_populates="items")
    tags: List["TodoTag"] = Relationship(
        back_populates="items",
        link_model=TodoItemTagLink,
    )
