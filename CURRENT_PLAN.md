# CURRENT PLAN – React + FastAPI Todo Template (Reset)

### Phase 2 – Backend Todo Domain & API
- [ ] Introduce a lightweight auth stub (e.g., header-based) compatible with future Stytch
      integration and wire it through FastAPI dependencies.
- [ ] Provide seed/reset helpers for the todo data (e.g., scripts under `ops/` and fixtures used by
      pytest) so local/E2E environments start from a deterministic state.
- [ ] Expand pytest coverage with contract-style assertions (response shape validation, error cases)
      inside the existing suite—this replaces the earlier schemathesis idea.

### Phase 3 – Backend Quality, Ops, and Docs
- [ ] Document the database reset + seeding strategy in `backend/README.md`
      and ensure Alembic revisions capture the canonical todo schema. Drop any legacy workout tables
      that still linger.
- [ ] Review logging/configuration defaults (env settings, health endpoints, observability notes) and
      document expectations for downstream implementers.

### Phase 4 – Frontend Platform Foundation
- [ ] Stand up Storybook following `roadmap/storybook_implementation.md`: install dependencies,
      create `.storybook/` config, add npm scripts, and document usage.

### Phase 5 – Frontend Todo Experience
- [ ] Audit the UI for accessibility, empty/loading/error states, and responsive behavior; tighten any
      gaps surfaced during Storybook adoption.
- [ ] Add reusable primitives or utilities that emerge while wiring Storybook stories (e.g., fixtures,
      decorators) and feed improvements back into the feature modules.

### Phase 6 – Testing & Verification Strategy
- [ ] Add unit-level coverage with Vitest for pure utilities/selectors and hook logic that can be
      exercised without a browser.
- [ ] Extend Playwright if new flows surface, but focus primarily on enriching the pytest suite for
      contract validation and ensuring data reset scripts integrate with both test harnesses.

### Phase 7 – Documentation, Agents, and Final Polish
- [ ] Finalize all `AGENTS_example.md` docs (root/backend/frontend) and then retire or archive
      redundant files under `./guides`.
- [ ] Refresh `README.md` (or convert to `README_example.md` + curated public README) once the Storybook
      and testing workflows stabilize; cross-link backend/frontend docs and Playwright instructions.
- [ ] Run a final validation pass: Ruff, pytest (with contract tests), npm build, Vitest, Playwright,
      and Docker Compose dev/test profiles before handing off.
