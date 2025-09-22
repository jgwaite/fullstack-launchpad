SHELL := /bin/bash
FRONTEND_TEST_PORT ?= 5180

.PHONY: help env-setup build test-build up down clean logs ps watch migrate db-reset test-up test-down e2e e2e-headed api-test-up api-test-down api-test seed

help:
	@echo "Forge Make targets (Docker Compose)"
	@echo "  env-setup        Copy .env.example -> .env if missing"
	@echo "  build            Build dev images (backend, frontend)"
	@echo "  test-build       Build test-profile images"
	@echo "  up               Start dev stack (postgres, backend, frontend)"
	@echo "  watch            Start dev stack with compose watch"
	@echo "  migrate          Run Alembic migrations in backend"
	@echo "  logs             Show recent logs (set SERVICE=name to scope)"
	@echo "  ps               List services"
	@echo "  down             Stop dev stack"
	@echo "  db-reset         Stop and remove dev volumes"
	@echo "  test-up          Start test profile stack"
	@echo "  test-down        Stop test profile stack"
	@echo "  e2e              Run frontend E2E tests (compose stack)"
	@echo "  e2e-headed       Run compose-backed E2E tests in headed mode"
	@echo "  api-test-up      Start dev API stack (postgres, backend)"
	@echo "  api-test-down    Stop or down dev API stack (CLEANUP=down|stop)"
	@echo "  api-test         Run backend pytest suite"
	@echo "  seed             Placeholder until todo seed script lands"

env-setup:
	@test -f .env || cp .env.example .env
	@echo ".env ready. Edit OPENAI_API_KEY or set PARSER_ALLOW_LLM=false."

build:
	docker compose build

test-build:
	docker compose --profile test build

up:
	docker compose up -d

watch:
	docker compose watch

migrate:
	docker compose exec backend alembic upgrade head

logs:
	@if [ -n "$(SERVICE)" ]; then \
		docker compose logs --tail=$${TAIL:-200} $(SERVICE); \
	else \
		docker compose logs --tail=$${TAIL:-200}; \
	fi

ps:
	docker compose ps

down:
	docker compose down

db-reset:
	docker compose down -v || true

test-up:
	docker compose --profile test up -d

test-down:
	docker compose --profile test down -v || true

e2e:
	cd frontend && npm run test:e2e:compose

e2e-headed:
	cd frontend && npm run test:e2e:compose:headed

api-test-up:
	docker compose up -d postgres backend

api-test-down:
	@if [ "$$CLEANUP" = "down" ]; then docker compose down; else docker compose stop; fi

api-test:
	cd backend && \
		uv run pytest -q tests

seed:
	@echo "Seed script not yet implemented for the todo template"
