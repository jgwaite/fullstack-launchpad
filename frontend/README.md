# Launchpad Todo Frontend

This package contains the single-page React app that showcases the new FastAPI todo board. The goal of this repository is to demonstrate a modern client architecture in a compact, easy-to-browse portfolio project—not to ship a production UI.

## Stack

- **React 19** + **React Router DOM** for routing
- **TanStack Query 5** for server state management
- **Zustand 5** for UI and filter state
- **Tailwind CSS 4** with ShadCN-style component wrappers
- **Vite 6** for bundling and local development

## Project structure

```text
src/
  App.tsx               # Browser router + screen registration
  app/
    app.css             # Tailwind theme tokens & global styles
    providers.tsx       # QueryClient, toast, and shared providers
  components/
    ui/                 # ShadCN-inspired primitives (button, dialog, etc.)
  features/
    todos/
      api/              # Zod schemas, TanStack Query options, mutations
      components/       # Dashboard layout, sidebar, detail panels, dialogs
      hooks/            # Query wrappers for lists & detail views
      utils/            # Status metadata (labels, colours)
  lib/
    api-client.ts       # Typed fetch wrapper with uniform error handling
    query-client.ts     # QueryClient factory + shared defaults
    utils.ts            # `cn` helper (clsx + tailwind-merge)
  stores/
    useTodoBoardStore.ts  # Zustand slice for selection + filter state
  main.tsx              # React entry point
```

## Key implementation details

- **Separation of concerns**: TanStack Query is responsible for server data (lists, items); Zustand only holds UI concerns such as the active list, status filter, and search term.
- **Defensive APIs**: Every fetch is parsed with Zod (`schemas.ts`) before hitting the UI. If the backend contract drifts, the error bubbles up in a single place.
- **Feature modularity**: The todo experience lives entirely inside `features/todos`. External consumers only interact with exported components and hooks.
- **Optimistic UX**: Mutations invalidate the appropriate list/detail queries and update toast feedback so the UI never drifts from backend state.
- **Reusable primitives**: Buttons, dialogs, badges, selects, etc. are thin wrappers over Radix + Tailwind so designers can reuse them across future features.

## Available routes & capabilities

- `GET /` – renders the todo dashboard
  - Sidebar lists all boards with optimistic create/delete actions
  - Detail panel provides status filters, keyword search, tag summary
  - Quick-add dialog for new tasks, inline status updates, deletion

## Running the frontend

```bash
cd frontend
npm install
npm run dev -- --host
```

The dev server proxies `/api` requests to the backend (`VITE_PROXY_TARGET`). Build a static bundle with `npm run build`. `npm start` serves the prebuilt SPA from `dist/` via `npx serve` (used by Docker and the compose test profile).

## Testing notes

- Playwright end-to-end tests (`npm run test:e2e:compose`) exercise the SPA against the docker-compose test profile (Chromium + Mobile Safari). Ensure `docker compose --profile test up -d` is running first; the helper script sets `PW_WEB_SERVER=0` so the tests talk directly to the containerised frontend.
- `npm run test:e2e` spins up a local Vite server (`npm run dev -- --host --port 5180`) and runs the same suite against it. Override `PW_BASE_URL` if you serve the app on a different port.
- `npm run build` is part of the expected validation flow; it ensures the Vite configuration is healthy and the module graph compiles.

## Follow-up ideas

- Introduce Vitest for pure utility coverage (e.g., tag aggregation, status helpers).
- Add skeleton loaders for the todo detail view once list switching becomes more complex.
- Layer in drag-and-drop ordering using dnd-kit now that the API supports re-sequencing.
