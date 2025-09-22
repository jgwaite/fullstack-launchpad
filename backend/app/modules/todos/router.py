from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlmodel import Session

from app.api.dependencies import get_db_session

from . import service
from .models import TodoStatus
from .schemas import (
    TodoItemCreate,
    TodoItemRead,
    TodoItemUpdate,
    TodoListCreate,
    TodoListDetail,
    TodoListRead,
    TodoListSummary,
    TodoListUpdate,
)

router = APIRouter(prefix="/todo", tags=["todo"])


@router.get("/lists", response_model=list[TodoListSummary])
def list_todo_lists(session: Session = Depends(get_db_session)) -> list[TodoListSummary]:
    lists = service.list_todo_lists(session)
    summaries: list[TodoListSummary] = []
    for entry in lists:
        base = TodoListRead.model_validate(entry.todo_list).model_dump()
        base["item_count"] = entry.item_count
        summaries.append(TodoListSummary(**base))
    return summaries


@router.post("/lists", response_model=TodoListRead, status_code=status.HTTP_201_CREATED)
def create_todo_list(
    payload: TodoListCreate,
    session: Session = Depends(get_db_session),
) -> TodoListRead:
    todo_list = service.create_todo_list(session, payload)
    return TodoListRead.model_validate(todo_list)


@router.get("/lists/{list_id}", response_model=TodoListDetail)
def get_todo_list(
    list_id: UUID,
    include_items: bool = Query(False, description="Include list items in the response"),
    session: Session = Depends(get_db_session),
) -> TodoListDetail:
    try:
        todo_list = service.get_todo_list(session, list_id, include_items=include_items)
    except service.TodoListNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo list not found") from error

    base = TodoListRead.model_validate(todo_list).model_dump()
    if include_items:
        items = [TodoItemRead.model_validate(item) for item in todo_list.items]
    else:
        items = []
    return TodoListDetail(**base, items=items)


@router.patch("/lists/{list_id}", response_model=TodoListRead)
def update_todo_list(
    list_id: UUID,
    payload: TodoListUpdate,
    session: Session = Depends(get_db_session),
) -> TodoListRead:
    try:
        todo_list = service.update_todo_list(session, list_id, payload)
    except service.TodoListNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo list not found") from error
    return TodoListRead.model_validate(todo_list)


@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_list(
    list_id: UUID,
    session: Session = Depends(get_db_session),
) -> Response:
    try:
        service.delete_todo_list(session, list_id)
    except service.TodoListNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo list not found") from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/lists/{list_id}/items", response_model=list[TodoItemRead])
def list_items(
    list_id: UUID,
    status_filter: TodoStatus | None = Query(None, alias="status"),
    tag: str | None = Query(None),
    search: str | None = Query(None),
    session: Session = Depends(get_db_session),
) -> list[TodoItemRead]:
    try:
        items = service.list_items(
            session,
            list_id,
            status=status_filter,
            tag=tag,
            search=search,
        )
    except service.TodoListNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo list not found") from error

    return [TodoItemRead.model_validate(item) for item in items]


@router.post(
    "/lists/{list_id}/items",
    response_model=TodoItemRead,
    status_code=status.HTTP_201_CREATED,
)
def create_item(
    list_id: UUID,
    payload: TodoItemCreate,
    session: Session = Depends(get_db_session),
) -> TodoItemRead:
    try:
        item = service.create_item(session, list_id, payload)
    except service.TodoListNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo list not found") from error
    return TodoItemRead.model_validate(item)


@router.get("/items/{item_id}", response_model=TodoItemRead)
def get_item(
    item_id: UUID,
    session: Session = Depends(get_db_session),
) -> TodoItemRead:
    try:
        item = service.get_item(session, item_id)
    except service.TodoItemNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo item not found") from error
    return TodoItemRead.model_validate(item)


@router.patch("/items/{item_id}", response_model=TodoItemRead)
def update_item(
    item_id: UUID,
    payload: TodoItemUpdate,
    session: Session = Depends(get_db_session),
) -> TodoItemRead:
    try:
        item = service.update_item(session, item_id, payload)
    except service.TodoItemNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo item not found") from error
    return TodoItemRead.model_validate(item)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: UUID,
    session: Session = Depends(get_db_session),
) -> Response:
    try:
        service.delete_item(session, item_id)
    except service.TodoItemNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo item not found") from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
