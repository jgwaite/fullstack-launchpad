# Fullstack Launchpad ( WIP )

A Docker-first starter that pairs a FastAPI backend with a Vite/React frontend and Postgres. The
compose setup supports two modes:

- **Hot-reload development** via `docker compose watch`, syncing source files into running
  containers and letting uvicorn/Vite handle fast restarts.
- **Prod-like images** for Playwright and other integration tests, serving prebuilt bundles without
  any live reload.

The goal is to ship a realistic full-stack baseline that can evolve into a production deployment
without rethinking the local tooling.

## What's Inside
- `backend/` — FastAPI + SQLModel project managed by `uv`
- `frontend/` — React (Vite) SPA with Playwright tests
- `docker-compose.yml` — dev stack plus a separate `test` profile
- `ops/` — Postgres init scripts and supporting configs
- `infra/` — Terraform scaffolding (optional)

## Prerequisites
- Docker 24+ with the Compose plugin (Apple Silicon and x86_64 both supported)
- `make` for the provided convenience targets

## Quick Start (Hot Reload)
1. Seed environment variables (creates `.env` from `.env.example` if missing):
   ```bash
   make env-setup
   ```
2. Launch the dev stack with file watching:
   ```bash
   make watch
   ```
   - Backend: http://localhost:8000 (FastAPI, uvicorn `--reload`)
   - Frontend: http://localhost:5173 (Vite dev server with HMR)
   - Postgres: localhost:5432 (`pgdata` volume persists data)

`docker compose watch` keeps the dev containers running while syncing local source code into the
container filesystem. Dependency file changes (`pyproject.toml`, `package.json`, etc.) trigger image
rebuilds automatically.

## Dev vs. Test Containers
- **Dev services (`backend`, `frontend`)** override the Dockerfile commands with live-reload entry
  points. When Compose watch copies your changes inside the container, uvicorn and Vite restart or
  hot-reload instantly.
- **Test services (`backend_test`, `frontend_test`)** reuse the same Dockerfiles but respect the
  production-style defaults: uvicorn without `--reload` and static assets served from the prebuilt
  `dist/` directory via `npx serve`. Use this profile when you need the exact runtime that Playwright
  (or CI) will exercise.

Bring the prod-like stack up with:
```bash
docker compose --profile test up -d
# or
make test-up
```

## Database & Migrations
- Run Alembic migrations inside the backend container:
  ```bash
  docker compose exec backend alembic upgrade head
  ```
- Reset the dev database (drops volumes):
  ```bash
  make db-reset
  ```
- Postgres init scripts live under `ops/initdb/` and run automatically on first start.

## Testing & Linting
- Backend unit tests:
  ```bash
  cd backend
  uv run pytest
  ```
- Frontend unit/E2E tests:
  ```bash
  cd frontend
  npm install
  npm run test
  npm run test:e2e            # expects test profile or local API to be running
  npm run test:e2e:compose    # spins up the test profile automatically
  ```
- CI-friendly Playwright run against prod-like services:
  ```bash
  make test-up
  cd frontend
  npm run test:e2e
  make test-down
  ```

## Helpful Make Targets
- `make build` — build dev images (`backend`, `frontend`)
- `make watch` — start dev stack with Compose watch (hot reload)
- `make up` / `make down` — start/stop dev stack without watch syncing
- `make migrate` — run `alembic upgrade head`
- `make logs [SERVICE=name]` — tail container logs
- `make test-up` / `make test-down` — manage the prod-like test profile

## Project Layout

### Backend (`backend/`)
```
backend/
├── app/                             # FastAPI application package
│   ├── api/                         # Router wiring, shared dependencies, HTTP error helpers
│   │   ├── routes.py                # Includes domain routers (system, todos, etc.)
│   │   ├── dependencies.py          # FastAPI Depends factories (auth stubs, pagination, ...)
│   │   └── errors.py                # Central place to register/shape API errors
│   ├── core/                        # Cross-cutting concerns used by multiple modules
│   │   ├── settings.py              # Pydantic settings; extends easily for env-specific config
│   │   ├── database.py              # SQLModel session helpers
│   │   └── logging.py               # Structured logging config
│   ├── db/                          # Migration wiring + shared SQLModel base classes
│   │   ├── migrations/              # Alembic env (revision scripts live here)
│   │   └── models.py                # Global models/mixins (UUID base, timestamps, etc.)
│   ├── modules/                     # Feature domains (add each bounded context here)
│   │   ├── system/                  # Example module: health/version heartbeat
│   │   ├── todos/                   # Primary feature: routes, schemas, service layer
│   │   └── <feature>/               # Template slot for future modules (auth, billing, ...)
│   ├── main.py                      # FastAPI factory + lifespan hooks
│   └── __init__.py                  # Exposes package metadata (version, tags)
├── tests/                           # Pytest suites mapped to modules/features
│   ├── test_health.py               # Covers system module
│   ├── test_todos.py                # End-to-end todo CRUD contract tests
│   └── <module>_*.py                # Template: add per-feature suites/mocks
├── pyproject.toml                   # uv project + tool configuration
├── alembic.ini                      # Alembic CLI config
├── Dockerfile                       # Multi-stage image (builder/runtime)
└── README.md                        # Backend-specific usage notes
```

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── app/                         # Application shell composition
│   │   ├── providers.tsx            # Wraps Router with QueryClient, theme, etc.
│   │   └── app.css                  # Global styles applied at the root
│   ├── features/                    # Feature-first architecture (scale by modules)
│   │   ├── todos/                   # Sample feature demonstrating the pattern
│   │   │   ├── api/                 # Typed API calls + react-query hooks
│   │   │   ├── components/          # Feature-scoped UI (panels, dialogs, layouts)
│   │   │   ├── hooks/               # Composition hooks (state selectors, derived data)
│   │   │   └── utils/               # Feature-only helpers (status maps, formatting)
│   │   └── <feature>/               # Template: replicate folders (api/components/hooks/…)
│   ├── components/                  # Shared UI primitives (Shadcn-based)
│   │   └── ui/                      # Reusable building blocks (Button, Dialog, ...)
│   ├── lib/                         # Reusable clients & singletons (query client, API client)
│   ├── stores/                      # Global state stores (Zustand examples live here)
│   ├── types/                       # Shared TypeScript types (API DTOs, domain enums)
│   ├── assets/                      # Static assets (favicons, logos; add per-project)
│   ├── App.tsx                      # Root component: wires router + feature entry points
│   └── main.tsx                     # Vite bootstrap (hydrates Providers + App)
├── tests/                           # Playwright and unit test helpers (expand per feature)
├── package.json                     # Frontend dependencies + scripts
├── Dockerfile                       # Dev/prod multi-stage build
└── vite.config.ts                   # Vite + proxy configuration
```

### Repo Root
```
.
├── docker-compose.yml               # Dev stack + prod-like test profile
├── Makefile                         # Convenience commands (watch, test-up, migrate, ...)
├── ops/                             # Postgres init scripts, helper tooling
├── infra/                           # Optional Terraform scaffolding (bootstrap AWS stack)
├── .env.example                     # Baseline environment variables for Compose
└── README.md                        # You are here
```

## Environment Variables
`.env.example` documents the defaults for local development. Key values:
- `BACKEND_PORT`, `FRONTEND_PORT` — exposed dev ports
- `BACKEND_TEST_PORT`, `FRONTEND_TEST_PORT`, `POSTGRES_TEST_DB` — test profile ports/database
- `DATABASE_URL` — backend connection string (defaults to the Compose network host `postgres`)
- `CORS_ORIGINS` — JSON list of allowed origins for FastAPI
- `VITE_PROXY_TARGET` — optional override when running the frontend outside of Compose

Adjust the `.env` file before running `make watch` or the test profile. Compose will inject these
settings into the corresponding containers.

## Troubleshooting
- **Watch not syncing?** Check `docker compose watch` output—files excluded by `.dockerignore` or the
  `develop.watch.ignore` globs will not sync.
- **Migrations failing on first boot?** Ensure Postgres finished its healthcheck; Compose waits for
  the database before starting the backend, but manual restarts may bypass the dependency chain.
- **Playwright needs a clean slate?** Use `make test-down` (drops test volumes) before rerunning
  `make test-up`.

## Next Steps
- Connect CI to the test profile to run Playwright in automation.
- Extend the backend domain models and migrations to ship your own features.
- Swap out the placeholder AI configuration in `.env.example` when integrating with real providers.
