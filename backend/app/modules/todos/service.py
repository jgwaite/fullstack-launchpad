from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload
from sqlmodel import Session

from .models import TodoItem, TodoList, TodoStatus, TodoTag
from .schemas import TodoItemCreate, TodoItemUpdate, TodoListCreate, TodoListUpdate


class TodoListNotFoundError(Exception):
    pass


class TodoItemNotFoundError(Exception):
    pass


@dataclass
class TodoListWithCount:
    todo_list: TodoList
    item_count: int


def list_todo_lists(session: Session) -> list[TodoListWithCount]:
    statement = (
        select(TodoList, func.count(TodoItem.id))
        .join(TodoItem, TodoItem.list_id == TodoList.id, isouter=True)
        .group_by(TodoList.id)
        .order_by(TodoList.created_at.asc())
    )
    results: Sequence[tuple[TodoList, int]] = session.exec(statement).all()
    return [TodoListWithCount(todo_list=row[0], item_count=row[1]) for row in results]


def create_todo_list(session: Session, data: TodoListCreate) -> TodoList:
    payload = data.model_dump(exclude_unset=True)
    todo_list = TodoList(**payload)
    session.add(todo_list)
    session.commit()
    session.refresh(todo_list)
    return todo_list


def _get_todo_list(session: Session, list_id: UUID) -> TodoList:
    todo_list = session.get(TodoList, list_id)
    if not todo_list:
        raise TodoListNotFoundError(str(list_id))
    return todo_list


def get_todo_list(session: Session, list_id: UUID, *, include_items: bool = False) -> TodoList:
    if include_items:
        statement = (
            select(TodoList)
            .where(TodoList.id == list_id)
            .options(selectinload(TodoList.items).selectinload(TodoItem.tags))
        )
        todo_list = session.exec(statement).scalar_one_or_none()
        if not todo_list:
            raise TodoListNotFoundError(str(list_id))
        _sort_items(todo_list)
        return todo_list

    return _get_todo_list(session, list_id)


def update_todo_list(session: Session, list_id: UUID, data: TodoListUpdate) -> TodoList:
    todo_list = _get_todo_list(session, list_id)
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(todo_list, field, value)
    session.add(todo_list)
    session.commit()
    session.refresh(todo_list)
    return todo_list


def delete_todo_list(session: Session, list_id: UUID) -> None:
    todo_list = _get_todo_list(session, list_id)
    session.delete(todo_list)
    session.commit()


def list_items(
    session: Session,
    list_id: UUID,
    *,
    status: TodoStatus | None = None,
    tag: str | None = None,
    search: str | None = None,
) -> list[TodoItem]:
    _get_todo_list(session, list_id)

    statement = (
        select(TodoItem)
        .where(TodoItem.list_id == list_id)
        .options(selectinload(TodoItem.tags))
        .order_by(TodoItem.position.asc(), TodoItem.created_at.asc())
    )

    if status is not None:
        statement = statement.where(TodoItem.status == status)

    if tag is not None:
        statement = (
            statement.join(TodoItem.tags)
            .where(func.lower(TodoTag.name) == tag.lower())
        )

    if search:
        pattern = f"%{search.lower()}%"
        statement = statement.where(
            or_(
                func.lower(TodoItem.title).like(pattern),
                func.lower(TodoItem.description).like(pattern),
                func.lower(TodoItem.notes).like(pattern),
            )
        )

    return session.exec(statement).scalars().all()


def create_item(session: Session, list_id: UUID, data: TodoItemCreate) -> TodoItem:
    todo_list = _get_todo_list(session, list_id)

    payload = data.model_dump(exclude_unset=True, exclude={"position", "tags"})
    item = TodoItem(list_id=todo_list.id, **payload)
    _update_completion_timestamp(item)
    item.position = _next_position(session, todo_list.id)
    session.add(item)
    session.flush()

    _resequence_item(session, item, desired_position=data.position)
    _synchronize_tags(session, item, data.tags)

    session.commit()
    session.refresh(item)
    return item


def _get_item(session: Session, item_id: UUID) -> TodoItem:
    item = session.get(TodoItem, item_id)
    if not item:
        raise TodoItemNotFoundError(str(item_id))
    return item


def get_item(session: Session, item_id: UUID) -> TodoItem:
    statement = (
        select(TodoItem)
        .where(TodoItem.id == item_id)
        .options(selectinload(TodoItem.tags))
    )
    item = session.exec(statement).scalar_one_or_none()
    if not item:
        raise TodoItemNotFoundError(str(item_id))
    return item


def update_item(session: Session, item_id: UUID, data: TodoItemUpdate) -> TodoItem:
    item = _get_item(session, item_id)

    updates = data.model_dump(exclude_unset=True)

    status = updates.pop("status", None)
    position = updates.pop("position", None)
    tags = updates.pop("tags", None)

    for field, value in updates.items():
        setattr(item, field, value)

    if status is not None:
        item.status = status
        _update_completion_timestamp(item)

    if position is not None:
        _resequence_item(session, item, desired_position=position)

    if tags is not None:
        _synchronize_tags(session, item, tags)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_item(session: Session, item_id: UUID) -> None:
    item = _get_item(session, item_id)
    list_id = item.list_id
    session.delete(item)
    session.flush()
    _resequence_all(session, list_id)
    session.commit()


def _resequence_item(session: Session, item: TodoItem, desired_position: int | None) -> None:
    items = session.exec(
        select(TodoItem)
        .where(TodoItem.list_id == item.list_id)
        .order_by(TodoItem.position.asc(), TodoItem.created_at.asc())
    ).scalars().all()

    others = [existing for existing in items if existing.id != item.id]

    if desired_position is None or desired_position >= len(others) + 1:
        ordered = others + [item]
    else:
        insert_at = max(desired_position, 0)
        ordered = others[:insert_at] + [item] + others[insert_at:]

    _apply_ordered_positions(session, ordered)


def _resequence_all(session: Session, list_id: UUID) -> None:
    items = session.exec(
        select(TodoItem)
        .where(TodoItem.list_id == list_id)
        .order_by(TodoItem.position.asc(), TodoItem.created_at.asc())
    ).scalars().all()

    _apply_ordered_positions(session, items)


def _synchronize_tags(session: Session, item: TodoItem, tags: Iterable[str] | None) -> None:
    if tags is None:
        return

    normalized: list[str] = []
    seen: set[str] = set()
    for raw in tags:
        if not raw or not raw.strip():
            continue
        norm = _normalize_tag(raw)
        if norm not in seen:
            seen.add(norm)
            normalized.append(norm)

    if not normalized:
        item.tags = []
        return

    normalized_lower = [tag.lower() for tag in normalized]

    existing_tags = (
        session.exec(
            select(TodoTag).where(func.lower(TodoTag.name).in_(normalized_lower))
        )
        .scalars()
        .all()
    )
    existing_map = {tag.name.lower(): tag for tag in existing_tags}

    attached: list[TodoTag] = []
    for tag_name in normalized:
        key = tag_name.lower()
        tag = existing_map.get(key)
        if not tag:
            tag = TodoTag(name=tag_name)
            session.add(tag)
            session.flush()
            existing_map[key] = tag
        attached.append(tag)

    item.tags = attached


def _normalize_tag(tag: str) -> str:
    return tag.strip().lower()


def _sort_items(todo_list: TodoList) -> None:
    todo_list.items.sort(key=lambda item: (item.position, item.created_at))


def _update_completion_timestamp(item: TodoItem) -> None:
    if item.status == TodoStatus.done:
        item.completed_at = datetime.now(tz=UTC)
    else:
        item.completed_at = None


def _next_position(session: Session, list_id: UUID) -> int:
    result = session.exec(
        select(func.count()).select_from(TodoItem).where(TodoItem.list_id == list_id)
    ).one()
    return int(result[0]) if result is not None else 0


def _apply_ordered_positions(session: Session, items: list[TodoItem]) -> None:
    if not items:
        return

    placeholder_base = 1000
    for index, current in enumerate(items):
        placeholder = placeholder_base + index
        if current.position != placeholder:
            current.position = placeholder
            session.add(current)

    session.flush()

    for index, current in enumerate(items):
        if current.position != index:
            current.position = index
            session.add(current)
