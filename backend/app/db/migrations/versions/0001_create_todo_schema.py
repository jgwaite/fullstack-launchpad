"""Create todo schema.

Revision ID: 0001_create_todo_schema
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_create_todo_schema"
down_revision = None
branch_labels = None
depends_on = None

UUID = postgresql.UUID(as_uuid=True)
STATUS_ENUM = sa.Enum(
    "todo",
    "in_progress",
    "blocked",
    "done",
    name="todo_status",
    native_enum=False,
)


def upgrade() -> None:
    op.create_table(
        "todo_lists",
        sa.Column("id", UUID, primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_table(
        "todo_tags",
        sa.Column("id", UUID, primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_table(
        "todo_items",
        sa.Column("id", UUID, primary_key=True, nullable=False),
        sa.Column("list_id", UUID, sa.ForeignKey("todo_lists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("status", STATUS_ENUM, nullable=False, server_default="todo"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["list_id"], ["todo_lists.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("list_id", "position", name="uq_todo_items_list_position"),
    )
    op.create_index("ix_todo_items_list_id", "todo_items", ["list_id"])
    op.create_index("ix_todo_items_status", "todo_items", ["status"])

    op.create_table(
        "todo_item_tags",
        sa.Column("item_id", UUID, sa.ForeignKey("todo_items.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", UUID, sa.ForeignKey("todo_tags.id", ondelete="CASCADE"), primary_key=True),
    )


def downgrade() -> None:
    op.drop_table("todo_item_tags")
    op.drop_index("ix_todo_items_status", table_name="todo_items")
    op.drop_index("ix_todo_items_list_id", table_name="todo_items")
    op.drop_table("todo_items")
    op.drop_table("todo_tags")
    op.drop_table("todo_lists")
