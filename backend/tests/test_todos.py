from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.api.dependencies import get_db_session
from app.main import app
from app.modules import load_all_modules


@pytest.fixture(name="engine")
def engine_fixture():
    load_all_modules()
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    try:
        yield engine
    finally:
        SQLModel.metadata.drop_all(engine)
        engine.dispose()


@pytest_asyncio.fixture
async def client(engine):
    def _get_session_override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db_session] = _get_session_override
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_todo_list_and_item_flow(client: AsyncClient):
    # Create a list
    create_list_resp = await client.post("/api/todo/lists", json={"name": "Inbox"})
    assert create_list_resp.status_code == 201
    todo_list = create_list_resp.json()
    list_id = todo_list["id"]

    # Lists endpoint returns summary with counts
    list_resp = await client.get("/api/todo/lists")
    assert list_resp.status_code == 200
    summaries = list_resp.json()
    assert summaries[0]["item_count"] == 0

    # Create first item
    create_item_resp = await client.post(
        f"/api/todo/lists/{list_id}/items",
        json={
            "title": "Draft project brief",
            "notes": "Focus on scope",
            "tags": ["Planning", "Important"],
        },
    )
    assert create_item_resp.status_code == 201
    first_item = create_item_resp.json()
    assert first_item["position"] == 0
    assert {tag["name"] for tag in first_item["tags"]} == {"planning", "important"}

    # Create second item at head to test reordering
    second_item_resp = await client.post(
        f"/api/todo/lists/{list_id}/items",
        json={
            "title": "Review notes",
            "position": 0,
        },
    )
    assert second_item_resp.status_code == 201
    second_item = second_item_resp.json()
    assert second_item["position"] == 0

    # Items are returned in order
    items_resp = await client.get(f"/api/todo/lists/{list_id}/items")
    assert items_resp.status_code == 200
    items = items_resp.json()
    assert [item["title"] for item in items] == ["Review notes", "Draft project brief"]
    assert [item["position"] for item in items] == [0, 1]

    first_item_id = items[1]["id"]

    # Update item status and ensure completed_at is set
    update_resp = await client.patch(
        f"/api/todo/items/{first_item_id}",
        json={"status": "done"},
    )
    assert update_resp.status_code == 200
    updated_item = update_resp.json()
    assert updated_item["status"] == "done"
    assert updated_item["completed_at"] is not None

    # Filter by status
    done_items_resp = await client.get(
        f"/api/todo/lists/{list_id}/items", params={"status": "done"}
    )
    done_items = done_items_resp.json()
    assert len(done_items) == 1
    assert done_items[0]["id"] == first_item_id

    # Retrieve list detail with items included
    detail_resp = await client.get(
        f"/api/todo/lists/{list_id}", params={"include_items": "true"}
    )
    detail = detail_resp.json()
    assert len(detail["items"]) == 2

    # Delete an item
    delete_item_resp = await client.delete(f"/api/todo/items/{first_item_id}")
    assert delete_item_resp.status_code == 204

    remaining_items_resp = await client.get(f"/api/todo/lists/{list_id}/items")
    remaining_items = remaining_items_resp.json()
    assert len(remaining_items) == 1
    assert remaining_items[0]["position"] == 0

    # Delete the list
    delete_list_resp = await client.delete(f"/api/todo/lists/{list_id}")
    assert delete_list_resp.status_code == 204

    empty_lists_resp = await client.get("/api/todo/lists")
    assert empty_lists_resp.json() == []
