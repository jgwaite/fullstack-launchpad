# Roadmap to Release — Fullstack Launchpad

This roadmap captures the full scope of work required to ship the repository itself as the showcase artifact. Codex agents should treat every section as authoritative: close each milestone before proceeding to the next, and record outcomes in `CURRENT_PLAN.md` or dedicated status docs.

---

## 0. Product Vision & Success Criteria

**Goal**: Present Fullstack Launchpad as a portfolio-grade template that proves mastery of modern full-stack engineering practices across documentation, code quality, automation, and developer experience.

**Primary audiences**
- Hiring managers and tech leads evaluating craft and architectural judgement
- Individual contributors reading the code to understand patterns
- Automated agents contributing/maintaining the repo going forward

**Definition of success**
- ✅ First impression: reviewers can understand the architecture and run the stack within five minutes using root-level documentation only
- ✅ Codebase expresses best practices (clean domain modules, consistent linting/formatting, defensive error handling, comprehensive tests)
- ✅ Automation (CI, QA, security scanning) reflects a production-ready workflow even if deploy jobs are placeholders
- ✅ Repo contains seeded demo data, screenshots, and Storybook artifacts so the UI/UX story is visible without spinning up services
- ✅ All legacy or incomplete assets are removed, consolidated, or clearly marked as future work

---

## 1. Milestone: Alignment & Audit

**Objective**: Eliminate ambiguity for contributors and document the current foundation.

**Tasks**
- Inventory outstanding WIP items in `CURRENT_PLAN.md`; archive any completed phases and add missing initiatives from this roadmap
- Merge agent-facing guidance (root, backend, frontend) into `AGENTS_example.md` files; mark legacy `guides/*` content as deprecated pending deletion
- Verify repository cleanliness: ensure no untracked build artifacts live under version control (e.g., `frontend/dist`, `frontend/node_modules`, leftover `.pytest_cache`)
- Confirm `.env.example` accurately reflects required configuration; strip obsolete workout/LLM variables or relegated features
- Capture current schema/API snapshots (FastAPI OpenAPI export, ERD image) for use in subsequent docs

**Deliverables**
- Updated `CURRENT_PLAN.md` aligned with this roadmap
- Actionable TODO list or ticket backlog for anything outside this plan
- Clean git status with documented rationale for any intentional omissions

**Exit criteria**
- Repo has a single, current source of truth for agent guidance and planning
- All references to deprecated workout-era functionality are logged for removal

---

## 2. Milestone: Narrative & Documentation Refresh

**Objective**: Craft a compelling, self-contained story about the project.

**Tasks**
- Rewrite root `README.md` to feature: elevator pitch, architecture diagram, tech stack table, quickstart, evaluation checklist, highlights of engineering practices
- Add `ARCHITECTURE.md` (or equivalent) that links backend/frontend overviews, dependency graphs, and operational assumptions
- Expand backend/frontend READMEs into tutorial-style deep dives (module maps, data flow diagrams, troubleshooting, common scripts)
- Publish ERD and API reference appendices referencing SQLModel definitions and FastAPI routers
- Introduce `CONTRIBUTING.md` with workflow expectations, branch policy, and DRI roles for fictional maintainers
- Add changelog template (`CHANGELOG.md` or `releases/`) seeded with initial entries summarising notable phases of the rebuild

**Deliverables**
- Cohesive documentation set that requires no external context
- Graphic assets stored under `docs/media/` (architecture diagram, ERD, screenshots) with source files if generated programmatically

**Exit criteria**
- New contributors can onboard from documentation alone
- README clearly signals best practices being showcased

---

## 3. Milestone: Backend Excellence

**Objective**: Demonstrate production-ready API engineering.

**Tasks**
- Harden module boundaries (system vs todos); introduce shared abstractions for errors, DTOs, pagination where appropriate
- Replace ad hoc HTTPException handling with centralized problem+json responses, leveraging `app/api/errors.py`
- Upgrade logging to structured JSON (uvicorn logging override, request IDs, correlation IDs) and document log parsing strategies
- Configure mypy (strict mode where feasible) and integrate type checking into local scripts + CI
- Expand pytest coverage: error cases, pagination, tag normalization, 409 conflicts, DB rollback behavior, Alembic migration smoke tests
- Add Testcontainers-based integration suite hitting a real Postgres container; keep SQLite tests for fast unit coverage
- Build deterministic seed tooling (`ops/seed/` + `make seed`) that provisions demo users, lists, items, tags, and time-based data
- Update Alembic migrations to reflect final schema and ensure down revisions clean up dependent artifacts safely
- Capture OpenAPI schema snapshot and publish static docs (Redoc/Swagger asset or Markdown excerpt)

**Deliverables**
- Passing `uv run ruff check`, `uv run ruff format --check`, `uv run mypy`, `uv run pytest` with coverage badge or summary in README
- Seed script plus documentation for resetting/bootstrapping data in dev/test environments
- Logging + error-handling examples in docs showing sample outputs

**Exit criteria**
- Backend meets or exceeds expectations for production readiness (types, logs, tests, migrations)
- Automated suite catches regression scenarios described in roadmap acceptance criteria

---

## 4. Milestone: Frontend Polish & UX Showcase

**Objective**: Deliver a refined SPA that highlights modern React architecture and UX craft.

**Tasks**
- Introduce linting/formatting (ESLint with typescript-eslint, Prettier or Biome) and integrate with npm scripts + CI
- Add Vitest coverage for pure logic (status helpers, selectors, query key builders, optimistic update utilities)
- Extend Playwright suite: error state flows, optimistic updates, offline handling, mobile viewport regression; ensure headed mode still works for demos
- Implement Storybook per `roadmap/storybook_implementation.md` (with Vite/Tailwind config, global decorators, controls) and seed initial stories for UI primitives + feature components
- Document accessibility audits (ARIA review, keyboard navigation) and run axe/Pa11y checks as part of CI or Storybook testing
- Capture static assets for portfolio presentation (dashboard screenshots, Storybook preview GIFs) stored under `docs/media/frontend`
- Add performance profiling notes (bundle size budget, React Query cache strategy) to frontend README
- Ensure design tokens/theme story is documented, and global styles align with Tailwind best practices; include dark/light mode showcase if feasible

**Deliverables**
- Updated `package.json` scripts for lint/typecheck/test, with consistent usage instructions
- Storybook deployment script or static export instructions (hostable via GitHub Pages or Netlify if desired)
- Accessibility + performance findings summarized in docs, with remediation steps tracked

**Exit criteria**
- Frontend build/test pipeline enforces lint, typecheck, unit, and e2e suites
- Stakeholders can evaluate UI components without running the full stack (Storybook + screenshots)

---

## 5. Milestone: Automation, Security & CI/CD Hygiene

**Objective**: Showcase mature automation even without live deployments.

**Tasks**
- Rewrite GitHub Actions to leverage `uv` (backend) and npm scripts (frontend): matrix across Python/Node versions if helpful
- Add CI jobs for Ruff, mypy, pytest, coverage upload (Codecov or badge artifact) and Playwright/Vitest on the frontend
- Retire or archive AWS deployment workflows; replace with documentation-only jobs or “noop” gates that explain how deployment would work in a real project
- Introduce Renovate/Dependabot configs for dependency updates on both Python and Node ecosystems
- Enable CodeQL or Semgrep scans, plus container scanning (Trivy) for Docker images; ensure results surface as status checks
- Add pre-commit hooks configuration for local guardrails (optional but recommended)
- Configure branch protection guidelines in documentation (required checks, review rules)

**Deliverables**
- Green CI pipeline covering lint/type/test/security on every PR and merge to main
- `SECURITY.md` describing responsible disclosure expectations (even if minimal)
- Dependency update automation configs committed at repo root

**Exit criteria**
- Every workflow in `.github/workflows` passes and matches current tooling
- Security and maintenance posture is documented and demonstrably enforced

---

## 6. Milestone: Ops, Developer Experience & Observability

**Objective**: Ensure the local/devops experience matches professional expectations.

**Tasks**
- Polish `docker-compose.yml`: add lightweight dashboards (pgAdmin optional), integrate healthcheck dashboards, capture sample Grafana dashboards if feasible
- Instrument backend and frontend for OpenTelemetry traces (or at least log correlation) and document how to view them locally
- Improve Makefile targets: `make demo` (seed + screenshots), `make qa` (run all checks), `make storybook` (launch design system)
- Update backend/frontend Dockerfiles with multi-stage caching tips, non-root users, and scan results
- Add VS Code dev containers or `.devcontainer` configuration with recommended extensions
- Document developer workflows in `docs/DEV_WORKFLOW.md` (IDE setup, testing shortcuts, recommended aliases)
- Provide scriptable teardown/reset commands for databases, caches, and Playwright artifacts

**Deliverables**
- Refined DX tooling visible via updated Make targets and docs
- Optional extras: tmux or GNU screen session scripts, CLI wrappers for seeding/test resets

**Exit criteria**
- New developers can spin up, test, seed, and observe the stack using a polished set of commands
- Observability story (logs, traces, metrics) is defined even if lightweight

---

## 7. Milestone: Final QA, Marketing Assets & Launch

**Objective**: Package the project for public release and portfolio distribution.

**Tasks**
- Run full validation suite (`make qa`): lint, type, unit, integration, migrations, Playwright
- Capture high-resolution screenshots, CLI recordings, and optionally a short Loom walkthrough; store assets under `docs/media/`
- Draft blog-style announcement (`docs/ANNOUNCEMENT.md`) summarizing lessons learned, stack choices, and future roadmap
- Prepare `PORTFOLIO_SUMMARY.md` with bullet points recruiters can skim (tech stack, highlights, metrics)
- Tag git release (e.g., `v1.0.0-portfolio`) with release notes referencing the changelog
- Ensure LICENSE is current (MIT/Apache) and referenced in README footer
- Archive deprecated files (`guides/*`, unused workflows) or delete once replacements are merged

**Deliverables**
- Release candidate branch or tag ready for publishing
- Portfolio collateral (screenshots, summary doc, announcement draft)
- Clean repository tree with only intentional assets

**Exit criteria**
- Stakeholders can evaluate and share the project without additional context
- Repo history clearly shows the polish and rigor invested in the final release

---

## Ongoing Maintenance Checklist

After the portfolio release, keep the repository healthy:
- Review dependency update PRs weekly; schedule monthly security scans
- Re-run seed scripts and smoke tests each time data models change
- Update documentation whenever workflows or tooling evolve
- Log future enhancement ideas in `ROADMAP.md` or GitHub Discussions
- Periodically audit CI run times, flake rates, and coverage thresholds

---

## Recommended File/Directory Additions

To support this roadmap, plan to introduce:
- `docs/` — houses architecture notes, diagrams, accessibility reports, and portfolio assets
- `docs/media/` — static assets (ERDs, screenshots, Storybook exports)
- `.github/dependabot.yml` or `renovate.json` — automated dependency updates
- `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` — industry-standard community files
- `scripts/` — helper CLI scripts (seed, qa, telemetry setup)
- `tests/integration/` — Postgres + Testcontainers suites
- `storybook-static/` (gitignored) — local Storybook builds for quick review

Ensure each addition is documented in the root README and relevant agent guides.

---

## Coordination & Tracking

- Use GitHub Projects or Issues to break milestones into actionable tasks (labels: `milestone:docs`, `milestone:backend`, etc.)
- Keep `CURRENT_PLAN.md` lightweight: high-level status, blockers, next actions; link to issues for detail
- Require PR templates capturing testing evidence, screenshots, and impact notes
- Schedule periodic retrospectives to adjust the roadmap if scope or priorities shift

---

## Next Steps for Agents

1. Confirm `CURRENT_PLAN.md` reflects this roadmap and remove conflicting instructions
2. Start with Milestone 1 tasks (alignment & audit) to lay the groundwork for subsequent milestones
3. Update this roadmap if priorities change; include timestamps and owners for accountability

Progress should be documented in commit messages and PR descriptions to maintain a transparent change history.
