# Repository Guidelines

# Agents Contract (root)

Agents working in this repository must **not** follow instructions here directly.  
Instead, always refer to **`./agents/AGENTS.md`** for the full Plan/Task workflow.

While working on code:
- Identify your assigned Plan (`./agents/state/plan/PLANxxx.md`) and Task (`./agents/state/task/TASKxxx.md`).
- Keep those files updated according to the rules in `./agents/AGENTS.md`.
- Roadmap (`./agents/ROADMAP_TO_RELEASE.md`) is read-only.

This root file is only a pointer — the canonical instructions live in `./agents/AGENTS.md`.

## Project Structure & Module Organization
- `backend/`: FastAPI + SQLModel; keep features in `app/modules` and mirror them under `backend/tests`.
- `frontend/`: Vite + React; store feature bundles in `src/features`, shared UI in `src/components/ui`, and clients in `src/lib`.
- `ops/` seeds Postgres, `infra/` holds Terraform, and `.env.example` lists Compose vars; `Makefile` plus `docker-compose.yml` run both dev and test stacks.

## Build, Test, and Development Commands
- `make env-setup` seeds `.env`; `make watch` runs the Docker Compose watch loop with hot reload.
- `make test-up` / `make test-down` switch the prod-like profile for Playwright and API contract checks.
- Backend loop: `cd backend && uv run pytest -q`, `uv run ruff check app`, `uv run alembic upgrade head`.
- Frontend loop: `cd frontend && npm run dev -- --host`, `npm run build`, `npm run test:e2e:compose` for end-to-end smoke.

## Coding Style & Naming Conventions
- Python: four-space indent, explicit typing, Ruff line-length 100; keep routers slim and push business logic into services.
- TypeScript/React: PascalCase components, camelCase utilities, `useX` hooks; keep feature assets in `src/features/<feature>` and shared primitives in `src/components`.
- Format JSON/YAML with two-space indent and write env variables in uppercase snake_case.

## Testing Guidelines
- Backend suites live in `backend/tests/test_<feature>.py`; run them with `make api-test` or `uv run pytest -q`, using `make api-test-up` / `api-test-down` to manage the database.
- Frontend flows live in `frontend/tests`; run `npm run test:e2e` locally and `npm run test:e2e:compose:headed` when reproducing UI issues.
- After `make test-up`, capture Playwright traces with `npx playwright test --trace=on` and document any gaps in the PR.

## Commit & Pull Request Guidelines
- Write imperative, scoped commits (e.g., `Add todo status filters`) and squash noisy WIP before review.
- Branch as `<initials>/<short-feature>`; rebase on `main` before opening a PR.
- PRs must link issues, surface migrations or env changes, attach screenshots or Playwright artifacts, and confirm `make watch`, `uv run pytest -q`, and `npm run test:e2e:compose` all pass.
