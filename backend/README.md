# Launchpad Todo Backend

FastAPI + SQLModel backend for the Launchpad todo template. The service is in the middle of a
rebuild, so expect the domain modules to evolve as the todo features land.

## Tooling
- Python 3.12
- Dependency manager: [uv](https://github.com/astral-sh/uv) (`uv.lock` tracked in git)
- Lint/format: [Ruff](https://docs.astral.sh/ruff/)
- Testing: pytest + HTTPX

## Setup
```bash
# Install dependencies (installs dev group by default)
uv sync

# Run formatting and linting
uv run ruff format app
uv run ruff check app

# Run tests
uv run pytest
```

## Local API
```bash
# Launch the API with live reload (requires Postgres running, e.g. via docker compose)
uv run uvicorn app.main:app --reload
```

## Docker
- `docker compose up -d postgres backend` starts Postgres and the API container.
- The backend image installs dependencies with `uv sync --frozen --no-dev` and runs migrations on boot.

## API Routes
- `GET /api/todo/lists` — list todo boards (with item counts)
- `POST /api/todo/lists` — create a new list
- `GET /api/todo/lists/{list_id}` — fetch list detail (include items via `?include_items=true`)
- `GET /api/todo/lists/{list_id}/items` — list items with optional `status`, `tag`, `search`
- `POST /api/todo/lists/{list_id}/items` — create an item (supports optimistic ordering and tags)
- `PATCH /api/todo/items/{item_id}` — update item fields, status, or position
- `DELETE /api/todo/items/{item_id}` — remove an item

## Migrations
Generate new migrations once the todo domain models are defined:
```bash
uv run alembic revision --autogenerate -m "create todo tables"
uv run alembic upgrade head
```

## Project Layout
```
app/
  core/        # settings, logging, database session helpers
  api/         # FastAPI router wiring and shared dependencies
  modules/     # domain packages (todo lists/items coming soon)
  main.py      # application factory + middleware
```
