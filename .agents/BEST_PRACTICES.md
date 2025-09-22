# Best Practices for This Stack

Auto-generated Table of Contents

- [Overview & Principles](#overview--principles)
- [Stack Versions](#stack-versions)
- [Frontend](#frontend)
  - [Project Layout](#project-layout)
  - [Project Standards](#project-standards)
  - [Build & Dev Loop (Vite + Compose Watch)](#build--dev-loop-vite--compose-watch)
  - [UI & Styling (shadcn/ui + Tailwind 4 + Storybook)](#ui--styling-shadcnui--tailwind-4--storybook)
  - [State Management (TanStack Query + Zustand)](#state-management-tanstack-query--zustand)
  - [Data Fetching (TanStack Query)](#data-fetching-tanstack-query)
  - [Forms (React Hook Form + Zod + shadcn/ui)](#forms-react-hook-form--zod--shadcnui)
  - [Routing (React Router 6)](#routing-react-router-6)
  - [Error Handling & UX](#error-handling--ux)
  - [Clean TypeScript Practices](#clean-typescript-practices)
- [Backend](#backend)
  - [Project Layout & Domain Modules](#project-layout--domain-modules)
  - [Async & Concurrency](#async--concurrency)
  - [Data Modeling & Migrations (SQLModel + Alembic)](#data-modeling--migrations-sqlmodel--alembic)
  - [Routers, Dependencies, Services](#routers-dependencies-services)
  - [Validation & Settings](#validation--settings)
  - [REST Conventions](#rest-conventions)
  - [Authentication & Authorization](#authentication--authorization)
  - [API Documentation](#api-documentation)
- [Cross-Cutting Practices](#cross-cutting-practices)
  - [Naming Conventions](#naming-conventions)
  - [Trunk-Based Development](#trunk-based-development)
  - [Agents Pattern](#agents-pattern)
  - [Local Development with Docker Compose Watch](#local-development-with-docker-compose-watch)
  - [Configuration & Secrets](#configuration--secrets)
- [Testing](#testing)
  - [Philosophy](#philosophy)
  - [Unit, Integration, API Contract](#unit-integration-api-contract)
  - [End-to-End (Playwright)](#end-to-end-playwright)
    - [Setup & Tooling](#setup--tooling)
    - [Project Structure](#project-structure)
    - [Fixtures & Page Objects](#fixtures--page-objects)
    - [Reporting & CI Observability](#reporting--ci-observability)
    - [Debugging & Troubleshooting](#debugging--troubleshooting)
  - [Data & Database Strategy](#data--database-strategy)
  - [Storybook and Component Testing](#storybook-and-component-testing)
  - [Mocking Policy](#mocking-policy)
- [CI/CD & Deployment](#cicd--deployment)
  - [uv Everywhere](#uv-everywhere)
  - [Ruff via uv](#ruff-via-uv)
  - [Builds & Environments](#builds--environments)
  - [Infrastructure Separation](#infrastructure-separation)
  - [Accessibility](#accessibility)
  - [Security](#security)
  - [Observability](#observability)
- [Divergences & Trade-offs](#divergences--trade-offs)
- [Template AGENTS.md](#template-agentsmd)
- [Appendix: Extended TypeScript Practices](#appendix-extended-typescript-practices)
- [Appendix: Snippet Library](#appendix-snippet-library)

## Overview & Principles

**Quick rules**
- MUST treat this handbook as the canonical operating manual for React + FastAPI workstreams.
- MUST record any deviation as a brief ADR linked in the pull request before merging.
- SHOULD inherit patterns from the examples in this document before inventing new ones.
- MUST bias every change toward accessibility, security, observability, and maintainability.

This handbook merges our curated guides into a single, example-driven reference. Follow the quick rules at the top of each subsection, then use the recipes to unblock implementation. When in doubt, copy the examples here, adjust for the feature, and document the decision.

## Stack Versions

**Quick rules**
- MUST target the major versions listed below and upgrade this table before adopting new majors.
- SHOULD pin compatible minor/patch versions in `package.json`, `uv.lock`, and Docker images.
- MUST validate compatibility in staging before promoting any dependency upgrade.

| Layer | Major version |
| --- | --- |
| React | 19 |
| Vite | 5 |
| React Router | 6 |
| shadcn/ui generator | latest (locked per project) |
| Tailwind CSS | 4 |
| TanStack Query | 5 |
| React Hook Form | 7 |
| Zod | 3 |
| FastAPI | 0.x |
| SQLModel | 0.x (SQLAlchemy under the hood) |
| Alembic | 1.x |
| pytest | 8 |
| Playwright | 1.x |
| uv | latest stable (>=0.4) |
| Ruff | latest stable |

## Frontend

### Project Layout

**Quick rules**
- MUST organize `src/` by feature, keeping shared primitives under dedicated top-level folders.
- MUST keep feature modules self-contained; cross-feature usage flows through shared layers (`components`, `lib`, `config`).
- SHOULD colocate tests, stories, and styles with the component or feature they validate.
- MUST configure absolute imports (`@/*`) and avoid fragile relative paths.

Example: Application skeleton
```sh
src
├── app/              # providers, router, global error boundaries
├── assets/           # fonts, favicons, static media
├── components/       # shared shadcn/ui derivatives and primitives
├── config/           # runtime config + env parsing
├── features/         # feature modules (auth, todos, profile, etc.)
├── hooks/            # reusable hooks (non-feature specific)
├── lib/              # prepared clients (stytch, analytics, http)
├── stores/           # global Zustand slices (kept minimal)
├── testing/          # test utils and fixtures
├── types/            # shared TypeScript types
└── utils/            # generic helpers (formatters, guards)
```

Example: Feature module layout
```sh
src/features/todos
├── api/              # TanStack Query fetchers, mutations, query keys
├── components/       # feature UI composed from shadcn/ui primitives
├── hooks/            # feature-specific hooks (guards, selectors)
├── pages/            # route-level components
├── stores/           # feature-scoped Zustand slices
├── types/            # Zod schemas + TS inference
└── tests/            # Vitest component tests + Playwright fixtures
```

### Project Standards

**Quick rules**
- MUST enforce ESLint (TypeScript strictness, import boundaries, naming) and Prettier in CI and pre-commit.
- MUST run `tsc --noEmit` in CI; TypeScript strict mode (`strict: true`) is non-negotiable.
- SHOULD wire Husky to run format + lint + type checks on `pre-commit` / `pre-push`.
- MUST maintain alias resolution in both Vite and Storybook.

Example: ESLint config excerpt (`eslint.config.mjs`)
```js
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['dist'],
    languageOptions: { parserOptions: { project: './tsconfig.json' } },
    plugins: {
      '@tanstack/query': require('@tanstack/eslint-plugin-query'),
    },
    rules: {
      'import/no-restricted-paths': ['error', { zones: [{ target: './src/features', from: './src/features', except: ['./**/index.ts'] }] }],
      '@tanstack/query/no-cache-key': 'error',
      'no-restricted-imports': ['error', { patterns: ['../*../*'] }],
    },
  }
);
```

Example: Path alias (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Build & Dev Loop (Vite + Compose Watch)

**Quick rules**
- MUST use Vite for local dev with HMR and rely on Docker Compose `develop.watch` for container workflows.
- MUST start the stack with `docker compose up --watch` for synchronized backend/frontend reloads.
- MUST serve built static assets (not the dev server) from the `frontend_test` service for Playwright and CI runs.
- SHOULD script baseline tasks (`npm run dev`, `npm run build`, `docker compose --profile test up`) in the project `package.json` or Makefile.

Recipe: docker-compose watch entries
```yaml
services:
  backend:
    develop:
      watch:
        - action: sync
          path: ./backend/app
          target: /app/app
          ignore:
            - "**/__pycache__/**"
            - "**/*.pyc"
        - action: rebuild
          path: ./backend/pyproject.toml
        - action: rebuild
          path: ./backend/uv.lock
  frontend:
    develop:
      watch:
        - action: sync
          path: ./frontend/src
          target: /app/src
        - action: sync
          path: ./frontend/public
          target: /app/public
        - action: rebuild
          path: ./frontend/package.json
        - action: rebuild
          path: ./frontend/package-lock.json
```

Recipe: SPA static test service
```yaml
services:
  frontend_test:
    image: forge-frontend:test
    command: ["sh", "-c", "npx serve -s build/client -l ${FRONTEND_TEST_PORT:-4173}"]
    environment:
      FRONTEND_TEST_PORT: ${FRONTEND_TEST_PORT:-4173}
    depends_on:
      backend_test:
        condition: service_healthy
    profiles: ["test"]
```

### UI & Styling (shadcn/ui + Tailwind 4 + Storybook)

**Quick rules**
- MUST build UI exclusively with [shadcn/ui](https://ui.shadcn.com/) components customized via Tailwind 4.
- MUST centralize design tokens and Tailwind config; avoid alternative CSS-in-JS runtimes.
- MUST document components in Storybook with real providers; no MSW inside stories.
- SHOULD enable Tailwind’s Vite plugin and reuse the same setup in Storybook.

Recipe: `tailwind.config.ts`
```ts
import { type Config } from 'tailwindcss';
import tailwindAnimate from 'tailwindcss-animate';

export default {
  content: ['src/**/*.{ts,tsx,html}', '.storybook/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'hsl(210 90% 50%)',
          foreground: 'hsl(0 0% 100%)',
        },
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
```

Example: Storybook preview (`.storybook/preview.ts`)
```ts
import type { Preview } from '@storybook/react';
import '../src/app/app.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient();

export const decorators = [
  (Story) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    </MemoryRouter>
  ),
];

export const parameters: Preview['parameters'] = {
  a11y: { element: '#storybook-root', manual: false },
  layout: 'centered',
};
```

### State Management (TanStack Query + Zustand)

**Quick rules**
- MUST handle server state with [TanStack Query](https://tanstack.com/query/latest); never duplicate it in Zustand.
- SHOULD scope Zustand stores to features; only persist slices that require reload durability (session, theme).
- MUST expose selectors (not entire store objects) to minimize re-renders.
- SHOULD bridge store state into queries via derived keys, not manual caching.

Recipe: feature-scoped Zustand slice
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SessionState = {
  userId?: string;
  roles: Array<'user' | 'admin'>;
  token?: string;
  setSession: (payload: Partial<Omit<SessionState, 'setSession' | 'clear'>>) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      userId: undefined,
      roles: [],
      token: undefined,
      setSession: (payload) => set(payload),
      clear: () => set({ userId: undefined, roles: [], token: undefined }),
    }),
    { name: 'session' }
  )
);

export const useIsAdmin = () => useSessionStore((state) => state.roles.includes('admin'));
```

Example: Query filtered by store state
```ts
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useSessionStore } from '@/stores/useSessionStore';

const TodoList = z.array(z.object({ id: z.string(), title: z.string(), ownerId: z.string() }));
type TodoList = z.infer<typeof TodoList>;

async function fetchTodos(ownerId: string): Promise<TodoList> {
  const response = await fetch(`/api/todos?owner_id=${ownerId}`);
  if (!response.ok) throw new Error(await response.text());
  return TodoList.parse(await response.json());
}

export function useTodos() {
  const ownerId = useSessionStore((state) => state.userId ?? '');
  return useQuery({
    queryKey: ['todos', ownerId],
    queryFn: () => fetchTodos(ownerId),
    enabled: ownerId.length > 0,
  });
}
```

### Data Fetching (TanStack Query)

**Quick rules**
- MUST define query keys per feature and centralize fetchers/mutations under `feature/api`.
- MUST validate request/response payloads with Zod before returning data to callers.
- SHOULD map transport errors to domain-specific errors at the boundary.
- MUST use optimistic updates and query invalidation (`setQueryData`, `invalidateQueries`) when mutating cached data.

Recipe: Feature API module (`src/features/todos/api/list-todos.ts`)
```ts
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const Todo = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean(),
  ownerId: z.string(),
});
export type Todo = z.infer<typeof Todo>;

const TodoListResponse = z.object({
  todos: z.array(Todo),
  cursor: z.string().nullable(),
});

export const todoKeys = {
  all: ['todos'] as const,
  list: (ownerId: string) => [...todoKeys.all, ownerId] as const,
};

async function fetchTodoList(ownerId: string) {
  const res = await fetch(`/api/todos?owner_id=${ownerId}`);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Unable to load todos');
  }
  return TodoListResponse.parse(await res.json());
}

export function useTodoList(ownerId: string) {
  return useQuery({
    queryKey: todoKeys.list(ownerId),
    queryFn: () => fetchTodoList(ownerId),
    enabled: ownerId !== '',
    staleTime: 30_000,
  });
}

const UpdateTodoInput = Todo.pick({ id: true, completed: true });

async function updateTodo(payload: z.infer<typeof UpdateTodoInput>): Promise<Todo> {
  const res = await fetch(`/api/todos/${payload.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return Todo.parse(await res.json());
}

export function useToggleTodo(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: todoKeys.list(ownerId) });
      const snapshot = qc.getQueryData<z.infer<typeof TodoListResponse>>(todoKeys.list(ownerId));
      if (snapshot) {
        qc.setQueryData(todoKeys.list(ownerId), {
          ...snapshot,
          todos: snapshot.todos.map((todo) =>
            todo.id === payload.id ? { ...todo, completed: payload.completed } : todo
          ),
        });
      }
      return { snapshot };
    },
    onError: (_error, _payload, context) => {
      if (context?.snapshot) qc.setQueryData(todoKeys.list(ownerId), context.snapshot);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: todoKeys.list(ownerId) }),
  });
}
```

### Forms (React Hook Form + Zod + shadcn/ui)

**Quick rules**
- MUST use [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) schemas for all forms that leave the component boundary.
- MUST surface validation, pending, and success states via accessible shadcn/ui components.
- SHOULD map server errors back into form fields using `setError` and `FormMessage`.
- MUST wrap mutations with TanStack Query to align optimistic UI and error reporting.

Recipe: Profile form (`src/features/profile/components/profile-form.tsx`)
```tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui';
import { useUpdateProfile } from '@/features/profile/api/update-profile';

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Provide a valid email'),
});

type ProfileInput = z.infer<typeof ProfileSchema>;

export function ProfileForm({ initial }: { initial: ProfileInput }) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: initial,
    mode: 'onBlur',
  });
  const mutation = useUpdateProfile();

  async function onSubmit(values: ProfileInput) {
    const result = await mutation.mutateAsync(values).catch((error: Error) => {
      form.setError('email', { type: 'server', message: error.message });
      throw error;
    });
    return result;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} aria-busy={mutation.isPending}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Ada Lovelace" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Form>
  );
}
```

### Routing (React Router 6)

**Quick rules**
- MUST use [React Router 6](https://reactrouter.com/en/main) with nested layouts and loader/action boundaries where needed.
- MUST implement guards as components or hooks, not scattered conditionals inside route elements.
- SHOULD expose accessible navigation with semantic links and focus management on route change.
- MUST co-locate route modules with features and register them via a central router configuration.

Recipe: Router tree with guard (`src/app/router.tsx`)
```tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/app-layout';
import { LoginPage } from '@/features/auth/pages/login-page';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { TodosPage } from '@/features/todos/pages/todos-page';
import { useSessionStore } from '@/stores/useSessionStore';

function RequireAuth() {
  const token = useSessionStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/todos', element: <TodosPage /> },
        ],
      },
    ],
  },
]);
```

### Error Handling & UX

**Quick rules**
- MUST provide skeleton/loading, empty, and error states for every data-driven component.
- SHOULD use Suspense and error boundaries to localize failures and avoid blank screens.
- MUST normalize backend errors into friendly, actionable messages.
- SHOULD include retry affordances (buttons, refetch) where recovery is possible.

Example: Query-driven component states
```tsx
import { useTodoList } from '@/features/todos/api/list-todos';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TodoListPane({ ownerId }: { ownerId: string }) {
  const { data, error, isLoading, isError, refetch } = useTodoList(ownerId);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load todos</AlertTitle>
        <AlertDescription>
          {(error as Error).message} — <button onClick={() => refetch()}>Try again</button>
        </AlertDescription>
      </Alert>
    );
  }
  if (!data?.todos.length) return <p>No tasks yet. Create your first todo.</p>;

  return (
    <ul>
      {data.todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

Example: Error boundary
```tsx
import { Component, ReactNode } from 'react';

type ErrorBoundaryState = { hasError: boolean };

export class Boundary extends Component<{ fallback: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

### Clean TypeScript Practices

**Quick rules**
- MUST prefer meaningful, searchable names over terse abbreviations.
- SHOULD keep functions small and single-purpose; extract helpers when branching grows complex.
- MUST return early to reduce indentation and flatten logic.
- SHOULD lean on type inference and `z.infer` to avoid duplication.

Example: Name clarity upgrade
```ts
// Before
function handler(u: User) {
  const a = u.roles.includes('admin');
  return a ? doThing(u) : deny(u);
}

// After
function handleUserAction(user: User) {
  const userIsAdmin = user.roles.includes('admin');
  return userIsAdmin ? processAdminAction(user) : denyAccess(user);
}
```

## Backend

### Project Layout & Domain Modules

**Quick rules**
- MUST group backend code by domain (auth, todos, billing) under `app/`.
- SHOULD keep `app/core` tiny: shared config, logging, db session management only.
- MUST colocate router, models, schemas, dependencies, and services inside each domain package.
- SHOULD align tests with domain modules to keep coverage obvious.

Example: FastAPI monolith layout (domain-first)
```sh
backend/
├── alembic/
├── app/
│   ├── core/                # shared foundations kept intentionally small
│   │   ├── config.py         # global settings loader
│   │   ├── database.py       # engine + session management
│   │   ├── logging.py        # structured logging config
│   │   └── events.py         # startup/shutdown hooks, hub wiring
│   ├── auth/
│   │   ├── router.py
│   │   ├── schemas.py        # Pydantic IO models
│   │   ├── models.py         # SQLModel entities
│   │   ├── dependencies.py   # parse_stytch_token, current_user, etc.
│   │   ├── exceptions.py
│   │   ├── service.py
│   │   ├── constants.py
│   │   ├── config.py
│   │   └── utils.py
│   ├── users/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── dependencies.py
│   │   ├── exceptions.py
│   │   ├── service.py
│   │   ├── constants.py
│   │   ├── config.py
│   │   └── utils.py
│   ├── tenants/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── dependencies.py
│   │   ├── exceptions.py
│   │   ├── service.py
│   │   ├── constants.py
│   │   ├── config.py
│   │   └── utils.py
│   ├── modules/              # business-specific domains (e.g., todos, billing)
│   │   ├── todos/
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── models.py
│   │   │   ├── dependencies.py
│   │   │   ├── exceptions.py
│   │   │   ├── service.py
│   │   │   ├── constants.py
│   │   │   ├── config.py
│   │   │   └── utils.py
│   │   └── …
│   ├── services/            # cross-cutting clients (mailer, filesystem, analytics)
│   │   ├── mailer.py
│   │   ├── filesystem.py
│   │   └── __init__.py
│   ├── extensions/          # middleware, instrumentation, adapters
│   │   ├── middleware.py    # request ID, correlation, timing
│   │   ├── telemetry.py
│   │   └── __init__.py
│   ├── utils/               # shared helpers kept small (formatters, schema mixins)
│   ├── exceptions.py        # shared domain exceptions
│   ├── routes.py            # central router registration
│   └── main.py              # FastAPI app factory, dependency wiring
├── tests/
│   ├── auth/
│   ├── users/
│   ├── tenants/
│   └── todos/
├── templates/
│   └── emails/
├── pyproject.toml
├── uv.lock
├── .env.example
├── alembic.ini
└── logging.ini
```

**Folder design notes**
- Store all domain directories inside `app/` (or `src/` if you prefer that root). The top-level folder holds global config, models, constants, and shared utilities, while `app/main.py` (or `src/main.py`) boots the FastAPI application.
- Every feature package follows the same contract:
  - `router.py` — endpoints mounted on the module router.
  - `schemas.py` — Pydantic IO models and response payloads.
  - `models.py` — SQLModel/SQLAlchemy entities.
  - `service.py` — module-specific business logic.
  - `dependencies.py` — composable dependency providers.
  - `constants.py` — module-level error codes, enums, and strings.
  - `config.py` — module-scoped settings/environment knobs.
  - `utils.py` — pure helpers (response shaping, enrichment).
  - `exceptions.py` — domain exceptions (`TodoNotFound`, etc.).
- `app/core/` should remain lean: config, logging, database bootstrap, and global lifespan hooks. Avoid turning it into a dumping ground.
- `app/modules/` (or `app/aws`, `app/posts`, etc.) hosts product domains. Use the `router/schemas/models/dependencies/service` pattern per module to keep boundaries explicit.
- `app/services/` wraps external integrations (mailer, filesystem, IdP clients). Keep them stateless and dependency-inject where used.
- `app/extensions/` centralizes middleware, telemetry, and other cross-cutting concerns—wire them in `main.py`.
- Tests mirror the domain tree (`tests/<module>/`) to keep coverage obvious and to encourage domain-focused fixtures.
- When a module needs code from another module, import it explicitly via the package path (`from app.users import service as user_service`)—never shortcut with relative imports that obscure boundaries.

### Async & Concurrency

**Quick rules**
- MUST implement routes and dependencies as `async def`; avoid blocking the event loop.
- MUST install `uvloop` + `httptools` via `uv` for production servers.
- SHOULD offload unavoidable blocking IO to FastAPI’s threadpool using `run_in_threadpool`.
- MUST move CPU-bound workloads to background workers (RQ/Celery) instead of the request path.

Recipe: uv dev workflow
```sh
uv sync --python 3.13
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Example: Threadpool escape hatch
```py
from fastapi import Depends
from starlette.concurrency import run_in_threadpool

async def expensive_legacy_call(payload: dict) -> dict:
    return await run_in_threadpool(lambda: legacy_sdk.call(payload))
```

### Data Modeling & Migrations (SQLModel + Alembic)

**Quick rules**
- MUST model database tables with SQLModel using lower_snake_case table names and `_id` foreign keys.
- MUST generate Alembic revisions with descriptive, chronological slugs (`20240815_add_todo_priority.py`).
- SHOULD enforce UTC timestamps (`*_at`) and domain-specific indexes.
- MUST keep migrations deterministic and reversible; avoid data migrations inside schema revisions when possible.

Recipe: SQLModel entity (`app/todos/models.py`)
```py
from datetime import datetime
from sqlmodel import Field, SQLModel

class Todo(SQLModel, table=True):
    __tablename__ = "todo"
    id: int | None = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True, foreign_key="user.id")
    title: str = Field(max_length=160, index=True)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
```

Example: Alembic revision header (`app/db/migrations/versions/20240815_add_todo_priority.py`)
```py
"""add todo priority column

Revision ID: 20240815_add_todo_priority
Revises: 20240801_seed_users
Create Date: 2024-08-15 12:34:56.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "20240815_add_todo_priority"
down_revision = "20240801_seed_users"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("todo", sa.Column("priority", sa.Integer(), nullable=False, server_default="0"))

def downgrade() -> None:
    op.drop_column("todo", "priority")
```

### Routers, Dependencies, Services

**Quick rules**
- MUST keep routers thin: delegate business logic to services and reuse dependency chains.
- SHOULD compose dependencies (`parse_stytch_token` → `current_user` → `owned_resource`) to reduce duplication.
- MUST return plain dicts/DTOs; let FastAPI handle response-model serialization.
- SHOULD centralize service logic for reuse and testability.

Recipe: Dependency chain with service
```py
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.dependencies import parse_stytch_token
from app.todos import schemas, service

async def current_user(token=Depends(parse_stytch_token)):
    return {"id": int(token["sub"]), "roles": token.get("roles", [])}

async def owned_todo(todo_id: int, user=Depends(current_user)):
    todo = await service.get_todo(todo_id)
    if not todo or todo.owner_id != user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo

router = APIRouter(prefix="/api/todos", tags=["todos"])

@router.get("/{todo_id}", response_model=schemas.TodoRead)
async def get_todo(todo=Depends(owned_todo)):
    return todo

@router.patch("/{todo_id}", response_model=schemas.TodoRead)
async def update_todo(payload: schemas.TodoUpdate, todo=Depends(owned_todo)):
    return await service.update_todo(todo.id, payload)
```

### Validation & Settings

**Quick rules**
- MUST validate request/response bodies with Pydantic schemas stored under each domain.
- SHOULD implement modular `BaseSettings` classes per domain and compose them in `core.config`.
- MUST favor async dependencies, even for configuration, to avoid blocking the event loop.
- SHOULD use pure ASGI middleware (functions) when latency matters; avoid `BaseHTTPMiddleware` unless necessary.
- SHOULD raise `ValueError` inside Pydantic validators to surface explicit 422 messages for client-facing rules.

Example: Modular settings (`app/core/config.py`)
```py
from functools import lru_cache
from pydantic import BaseSettings, Field

class AppSettings(BaseSettings):
    environment: str = Field(..., alias="APP_ENV")
    cors_origins: list[str] = Field(default=["http://localhost:5173"])

class DatabaseSettings(BaseSettings):
    url: str = Field(..., alias="DATABASE_URL")
    echo: bool = Field(default=False, alias="DATABASE_ECHO")

class AuthSettings(BaseSettings):
    stytch_project_id: str = Field(..., alias="STYTCH_PROJECT_ID")
    stytch_secret: str = Field(..., alias="STYTCH_SECRET")
    jwt_secret: str = Field(..., alias="JWT_SECRET")

class Settings(BaseSettings):
    app: AppSettings = AppSettings()
    database: DatabaseSettings = DatabaseSettings()
    auth: AuthSettings = AuthSettings()

@lru_cache(1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]

Example: Business-rule validation surfaced via `ValueError`
```py
import re
from pydantic import BaseModel, EmailStr, field_validator

STRONG_PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$")

class ProfileCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not STRONG_PASSWORD_REGEX.fullmatch(value):
            raise ValueError(
                "Password must include upper, lower, digit, and special characters and be 12+ chars"
            )
        return value
```

Using this schema as a dependency in a route causes FastAPI to emit a structured 422 response with the validator message, keeping UX and documentation aligned.

### REST Conventions

**Quick rules**
- MUST use plural nouns for collection routes (`/api/todos`), singular for resources (`/api/todos/{todo_id}`).
- MUST share parameter names across endpoints to unlock dependency reuse (`todo_id`, `project_id`).
- SHOULD return 404 for missing resources, 403 for forbidden, 422 for validation errors.
- MUST expose stable error codes/messages for frontend mapping.

Example: RESTful router snippet
```py
router = APIRouter(prefix="/api/todos", tags=["todos"])

@router.get("", response_model=list[schemas.TodoRead])
async def list_todos(query: schemas.TodoQuery = Depends()):
    return await service.list_todos(query)

@router.post("", response_model=schemas.TodoRead, status_code=status.HTTP_201_CREATED)
async def create_todo(payload: schemas.TodoCreate, user=Depends(current_user)):
    return await service.create_todo(payload, owner_id=user["id"])

@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo=Depends(owned_todo)):
    await service.delete_todo(todo.id)
```

### Authentication & Authorization

**Quick rules**
- MUST integrate [Stytch](https://stytch.com/docs/api) as the primary IdP; tokens validated via dependency.
- SHOULD deliver auth cookies with `Secure`, `HttpOnly`, `SameSite=strict` in production.
- MUST provide a minimal JWT fallback (local/dev) guarded behind env flags.
- SHOULD centralize permission checks in services/dependencies, not decorators or middleware.

Recipe: Stytch token dependency
```py
from fastapi import Depends, Header, HTTPException, status
from stytch import Client as StytchClient
from app.core.config import get_settings

async def stytch_client(settings=Depends(get_settings)) -> StytchClient:
    auth = settings.auth
    return StytchClient(project_id=auth.stytch_project_id, secret=auth.stytch_secret)

async def parse_stytch_token(
    authorization: str | None = Header(default=None),
    client: StytchClient = Depends(stytch_client),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        return client.oauth.authenticate_token(token).dict()
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
```

Example: JWT fallback for local dev
```py
import jwt
from fastapi import Depends, Header, HTTPException, status
from app.core.config import get_settings

async def parse_jwt_token(
    authorization: str | None = Header(default=None),
    settings=Depends(get_settings),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        return jwt.decode(token, settings.auth.jwt_secret, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

### API Documentation

**Quick rules**
- MUST disable interactive docs in production by default; explicitly allow only trusted environments.
- SHOULD annotate every route with `response_model`, `status_code`, `description`, and tags so generated docs stay meaningful.
- SHOULD document alternate responses with the `responses` attribute when behavior varies by status code.
- MUST keep OpenAPI metadata in sync with real behavior before shipping breaking changes.

Recipe: Toggle docs per environment
```py
from fastapi import FastAPI
from starlette.config import Config

config = Config(".env")
ENVIRONMENT = config("ENVIRONMENT")
ALLOW_DOCS = {"local", "staging"}

app_kwargs = {"title": "Todo API", "version": "1.0.0"}
if ENVIRONMENT not in ALLOW_DOCS:
    app_kwargs["openapi_url"] = None

app = FastAPI(**app_kwargs)
```

Example: Rich response documentation
```py
from fastapi import APIRouter, status
from app.todos import schemas

router = APIRouter(prefix="/api/todos", tags=["todos"])

@router.post(
    "",
    response_model=schemas.TodoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a todo",
    description="Creates a todo owned by the authenticated user.",
    responses={
        status.HTTP_200_OK: {
            "model": schemas.TodoRead,
            "description": "Returns an existing todo when idempotent logic applies.",
        },
        status.HTTP_202_ACCEPTED: {
            "model": schemas.TodoQueued,
            "description": "Acknowledges creation but defers processing.",
        },
    },
)
async def create_todo(payload: schemas.TodoCreate, user=Depends(current_user)):
    return await service.create_todo(payload, owner_id=user["id"])
```

Annotating routes this way keeps generated docs actionable for frontend consumers and external partners.
```

## Cross-Cutting Practices

### Naming Conventions

**Quick rules**
- MUST apply the S‑I‑D heuristic (Short, Intuitive, Descriptive) for names across languages.
- MUST follow A/HC/LC (Action + High Context + Low Context) for functions (e.g., `fetchUserTodos`).
- SHOULD avoid redundant context (`TodoCard.todoTitle` → `TodoCard.title`).
- MUST follow PEP 8 in Python and camelCase/PascalCase in TypeScript.

Example: Naming cheatsheet
```text
TypeScript functions: camelCase → fetchTodoById
React components/types: PascalCase → TodoListView
Python modules: snake_case → todo_service.py
Python classes: PascalCase → TodoService
```

### Trunk-Based Development

**Quick rules**
- MUST keep feature branches under two days and merge via small, rebased PRs (<400 LOC when possible).
- MUST ensure main branch is releasable at all times; broken builds block merges.
- SHOULD guard incomplete work with feature flags or route guards.
- MUST update or add tests when behavior changes.

### Agents Pattern

**Quick rules**
- MUST maintain a root `AGENTS.md` (template below) and scoped variants (`frontend/`, `backend/`) when deeper rules are required.
- SHOULD keep `CURRENT_TASK.md` accurate during multi-step efforts; delete it when the task completes.
- MUST document breaking workflows (build/test/deploy) in the agent guides so humans and AI stay aligned.

### Local Development with Docker Compose Watch

**Quick rules**
- MUST run `docker compose up --watch` for the canonical local stack; avoid ad-hoc scripts.
- SHOULD rely on `develop.watch` sync for fast reloads instead of bind mounting entire repositories.
- MUST ensure Compose health checks stay green; fix failing services before continuing.
- SHOULD use Compose profiles (`--profile test`) to spin up isolated testing stacks.

Example: Dev commands
```sh
# full stack with live reload
docker compose up --watch

# rebuild backend after dependency change
docker compose build backend && docker compose up backend

# run test profile for Playwright
docker compose --profile test up --build frontend_test backend_test postgres_test
```

### Configuration & Secrets

**Quick rules**
- MUST drive configuration via environment variables with typed parsing (`config/` on frontend, `BaseSettings` on backend).
- MUST keep secrets out of git; use a secrets manager or CI-provided secrets.
- SHOULD provide `.env.example` onboarding files and reference them in docs.
- MUST separate environment overrides (dev/test/staging/prod) without branching config in code.

## Testing

### Philosophy

**Quick rules**
- MUST optimize for confidence, not raw coverage metrics.
- MUST test realistic flows against the composed stack (FastAPI + Postgres + SPA static server).
- SHOULD reserve unit tests for pure logic modules; prioritize E2E and integration elsewhere.
- MUST keep tests independent and parallelizable.

### Unit, Integration, API Contract

**Quick rules**
- MUST use `pytest` with `httpx.AsyncClient` for backend request/response validation.
- SHOULD include OpenAPI contract checks when API changes risk breaking the frontend.
- MUST run tests via `uv run pytest` so dependencies resolve consistently.
- SHOULD seed test data via fixtures; do not rely on production data snapshots.

Recipe: FastAPI integration test
```py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/healthz")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
```

### End-to-End (Playwright)

**Quick rules**
- MUST limit browser projects to Chromium (desktop) and Mobile Safari (WebKit emulation).
- MUST point tests at the static SPA server (`frontend_test`) using `BASE_URL` (default `http://localhost:4173`).
- SHOULD structure tests by feature with Page Objects for complex flows.
- MUST collect traces, screenshots, and videos on failure; enable retries in CI.

#### Setup & Tooling
- MUST install Playwright browsers for Chromium and WebKit on first setup (`npx playwright install chromium webkit`) or via a dedicated package script so CI and local machines stay aligned.
- SHOULD run `npx playwright install-deps` on Linux CI runners that lack the shared system libraries Playwright expects.
- MUST start the compose test profile before running specs locally: `docker compose --profile test up --build backend_test frontend_test postgres_test`.
- SHOULD load test-only environment variables from `.env.test` so credentials and flags stay out of code.

#### Project Structure
```text
e2e/
├── tests/
│   ├── auth/login.spec.ts
│   ├── profile/profile.spec.ts
│   └── todos/todos.spec.ts
├── fixtures/
│   └── auth-fixture.ts
├── page-objects/
│   ├── login-page.ts
│   ├── dashboard-page.ts
│   └── todo-page.ts
├── utils/
│   ├── test-data.ts
│   └── accessibility.ts
└── playwright.config.ts
```
- MUST colocate feature-specific helpers with their specs; shared helpers live under `fixtures/` or `utils/`.
- SHOULD keep page objects focused on user actions and selectors; keep assertions inside specs for clarity.

#### Fixtures & Page Objects
```ts
// fixtures/auth-fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```
- MUST centralize authentication flows, seeded data, and cleanup inside fixtures to keep specs declarative.
- SHOULD expose page-object helpers (e.g., `LoginPage.signIn(email, password)`) that wrap role-based locators.

#### Reporting & CI Observability
- MUST enable HTML reports and persist them as CI artifacts; add `['html', { open: 'never' }]` to the reporter list.
- SHOULD emit JUnit XML (`['junit', { outputFile: 'reports/playwright-junit.xml' }]`) when CI parses test results.
- MUST keep trace/screenshot/video capture enabled on retries and surface them via `npx playwright show-report`.
- SHOULD forward Playwright logs to CI stdout/stderr and link them from job summaries for rapid triage.

#### Debugging & Troubleshooting
- MUST prefer interactive debugging with `PWDEBUG=1 npx playwright test --project=chromium-desktop tests/auth/login.spec.ts`.
- SHOULD use `page.pause()` while diagnosing complex flows and remove the pause before committing.
- MUST verify Compose health checks (especially `frontend_test`) when navigation fails; tests require the built SPA, not the dev server.
- SHOULD replay failed traces locally using `npx playwright show-trace trace.zip` and capture follow-up actions in issues or ADRs.

Example: `playwright.config.ts`
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 15'] },
    },
  ],
  webServer: [
    {
      command: 'docker compose --profile test up --build backend_test frontend_test postgres_test',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
```

Recipe: Auth journey
```ts
import { test, expect } from '@playwright/test';

test.describe('auth flows', () => {
  test('user can log in and view dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await page.getByLabel('Email').fill(process.env.PLAYWRIGHT_TEST_USER_EMAIL ?? 'demo@example.com');
    await page.getByLabel('Password').fill(process.env.PLAYWRIGHT_TEST_USER_PASSWORD ?? 'p@ssword123');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');
  });
});
```

### Data & Database Strategy

**Quick rules**
- MUST support both persistent+reset (local) and ephemeral (CI) database strategies.
- SHOULD provide scripted reset commands developers can run before test suites.
- MUST create isolated test databases per profile (e.g., `postgres_test` service).
- SHOULD seed data via idempotent scripts (`uv run python -m app.seeds.todos`) per environment.

Example: DB management commands
```sh
# Reset persistent local DB (drops and recreates schema, seeds starter data)
docker compose exec backend sh -lc "uv run alembic downgrade base && uv run alembic upgrade head && uv run python -m app.seeds.todos"

# Launch ephemeral CI stack (containers terminate after tests)
docker compose --profile test up --build --abort-on-container-exit --remove-orphans backend_test frontend_test postgres_test
```

### Storybook and Component Testing

**Quick rules**
- MUST keep Storybook in sync with production providers (QueryClient, Router, Theme).
- MUST avoid MSW inside stories; rely on props and mock data objects instead.
- SHOULD run Storybook alongside the backend when developing data-aware components.
- MUST document Storybook commands in `package.json`.

Example: `.storybook/main.ts`
```ts
import { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  viteFinal: (config) => {
    config.plugins = config.plugins ?? [];
    config.plugins.push(tsconfigPaths());
    return config;
  },
};
export default config;
```

### Mocking Policy

**Quick rules**
- MUST avoid mocking backend APIs in frontend tests unless the external system is third-party and unavailable.
- SHOULD stub third-party integrations narrowly (e.g., payment provider) and document the scope.
- MUST remove mocks once a real implementation exists; no long-lived mock-only flows.
- SHOULD prefer seed data + real services for integration confidence.

## CI/CD & Deployment

### uv Everywhere

**Quick rules**
- MUST manage Python dependencies with `uv` (no Poetry).
- MUST check in `uv.lock` and run `uv sync --frozen` in CI and Docker builds.
- SHOULD expose helper scripts (`uv run`) for linting, formatting, testing, and serving.
- MUST align local, CI, and container workflows on the same Python version.

Recipe: uv cheat sheet
```sh
uv lock                     # resolve and write uv.lock
uv sync --python 3.13       # install deps into .venv (respect uv.lock)
uv run ruff check app       # lint backend
uv run pytest -q            # run backend tests
uv run fastapi dev app/main.py  # optional local dev if not using compose
```

### Ruff via uv

**Quick rules**
- MUST lint and format Python with Ruff configured via `ruff.toml`.
- SHOULD run `uv run ruff check --fix` locally; CI runs `uv run ruff check` + `uv run ruff format --check`.
- MUST document suppressed rules with rationale inside `ruff.toml`.
- SHOULD set `known-first-party` to `app` to keep imports clean.

Example: `ruff.toml`
```toml
[tool.ruff]
target-version = "py312"
line-length = 100
select = ["E", "F", "W", "B", "I", "ASYNC", "UP"]
ignore = ["E501"]

[tool.ruff.lint.isort]
known-first-party = ["app"]

[tool.ruff.lint.per-file-ignores]
"app/db/migrations/versions/*.py" = ["E501"]
```

### Builds & Environments

**Quick rules**
- MUST build Docker images using `uv sync --frozen --no-dev` in the backend stage and `npm ci && npm run build` in the frontend stage.
- MUST run Alembic migrations on backend container start (dev/test) and as a separate step in production deploys.
- MUST serve built SPA assets for the Playwright profile (`frontend_test`).
- SHOULD document Compose profiles for dev/test/prod parity.

Example: Compose test services
```yaml
services:
  backend_test:
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${BACKEND_TEST_PORT:-8001}"]
  frontend_test:
    command: ["sh", "-c", "npx serve -s build/client -l ${FRONTEND_TEST_PORT:-4173}"]
```

### Infrastructure Separation

**Quick rules**
- MUST keep infrastructure-as-code (Terraform, Helm, etc.) in a separate private repository.
- SHOULD treat this application repo as deployable artifacts only (containers, static assets).
- MUST link deployment instructions in the infra repo; this handbook only references high-level expectations.
- SHOULD align environment naming between repos (`dev`, `staging`, `prod`) for clarity.

### Accessibility

**Quick rules**
- MUST provide accessible names/labels (`aria-label`, `aria-labelledby`) for interactive elements.
- SHOULD use shadcn/ui primitives that include focus management and ARIA roles.
- MUST meet WCAG AA contrast ratios; Tailwind design tokens should enforce this.
- SHOULD trap focus in modals and return focus on close.

### Security

**Quick rules**
- MUST validate all external input (FastAPI via Pydantic, frontend via Zod) and refuse unsafe data.
- MUST store secrets in a secrets manager; never commit credentials.
- SHOULD enforce content security policy (CSP) headers and strict CORS per environment.
- MUST rotate tokens/keys on compromise and log auth events for auditing.

### Observability

**Quick rules**
- MUST expose `/api/healthz` for readiness checks and ensure Compose health checks hit it.
- SHOULD emit structured JSON logs with request IDs for traceability.
- MUST forward unhandled errors to monitoring (Sentry, OpenTelemetry) as configured.
- SHOULD collect latency/error metrics for critical routes and background jobs.

## Divergences & Trade-offs

- TanStack Query is the only sanctioned server-state library; we do not use SWR, Apollo, or URQL to reduce cognitive load.
- Zustand owns client/app state; Redux and large global stores are out of scope unless explicitly approved.
- shadcn/ui + Tailwind 4 + Storybook is our UI stack; alternative component or styling systems are excluded for consistency.
- Stytch is the preferred IdP; the JWT fallback exists only for local/dev parity.
- Playwright targets Chrome (Chromium) and Mobile Safari only to keep flake rates low.
- Docker Compose `frontend_test` serves built static assets so E2E matches production bundles.
- `uv` replaces Poetry everywhere to unify dependency management and improve caching.

## Template AGENTS.md

```
---
name: "React + FastAPI Engineering Rules"
description: "Operational guardrails for contributors and AI agents working on the React 19 + FastAPI stack."
category: "Navigation"
tags: ["rules", "build", "test", "deploy", "dx"]
lastUpdated: "YYYY-MM-DD"
---

# Engineering Rules & Navigation

## Quick rules
- Update `CURRENT_TASK.md` at each meaningful step; delete it when the task is done.
- Build/lint/test gates: `npm run lint`, `npm run typecheck`, `uv run ruff check app`, `uv run pytest`, `npm run test`, `npx playwright test`.
- Run the full stack with `docker compose up --watch`; use `docker compose --profile test up` for Playwright and API contract suites.
- Ship only after Playwright (Chrome + Mobile Safari) passes against the static SPA bundle.
- Copy patterns from `/BEST_PRACTICES.md`; document any divergence via ADR before merge.

## Build & Test Commands
- Frontend dev: `npm run dev -- --host 0.0.0.0 --port 5173`
- Frontend build: `npm run build && npm run preview`
- Backend install: `uv sync --python 3.13`
- Backend dev: `uv run uvicorn app.main:app --reload`
- Backend tests: `uv run pytest -q`
- Lint/format: `uv run ruff check app`, `uv run ruff format app`, `npm run lint`, `npm run format`
- E2E: `npx playwright test --project=chromium-desktop --project=mobile-safari`

## Architecture Guardrails
- Frontend: React 19 + Vite 5 + React Router 6, TanStack Query 5, feature-first layout, shadcn/ui + Tailwind 4, Zustand for app state only.
- Backend: FastAPI async routes, SQLModel + Alembic migrations, thin routers with dependency chains, Stytch-first auth.
- Compose: watch mode for dev; static SPA profile for tests; migrations run on backend start.

## Git Workflow
- Branch names: `initials/feature-short-description` (e.g., `jd/add-todo-filters`).
- Rebase on `main` daily and before push; favour fast-forward merges after green CI.
- Keep commits scoped, descriptive, and linked to issues/ADRs; avoid force pushes after review without agreement.
- Tag releases/production deploys and update release notes as part of the merge checklist.

## Definition of Done
- All linters/tests pass, health checks green, no TODOs in production paths.
- Accessibility reviewed (labels, focus, contrast) for new UI.
- Auth, data, and configuration changes documented in PR descriptions and ADRs where needed.
- `CURRENT_TASK.md` cleared and stories/tests updated.

## Common Issues & Fixes
- Vite port already in use → stop stray dev servers or run `npm run dev -- --port 5174`.
- Playwright flake on startup → ensure `docker compose --profile test up` is running and `BASE_URL` targets `http://localhost:4173`.
- Alembic revision conflicts → reconcile with `uv run alembic merge heads` and document merged changes.
- ESLint path import errors → run `npm run lint -- --fix` after updating path aliases.

## Changelog & Knowledge Capture
- Update `docs/changelog.md` (or repo-level changelog) for shippable work, highlighting user-facing impact and feature flags toggled.
- Link relevant ADRs, monitoring dashboards, and Playwright trace artifacts in the PR before merge.
- Log follow-up items as GitHub issues, noting owners and timelines in the changelog entry.
```

## Appendix: Extended TypeScript Practices

**Quick rules**
- MUST favour meaningful, pronounceable names and shared vocabulary across the codebase.
- SHOULD write small, single-purpose functions with early returns and explicit inputs/outputs.
- MUST model data with focused types/interfaces and avoid mutating function arguments.
- SHOULD make error messages actionable, log unexpected branches, and centralise formatting via Prettier.

### Naming & Vocabulary
```ts
// Bad
const dtaRcrd102 = {
  genymdhms: new Date(),
  pszqint: 10,
};

// Good
const customerRecord = {
  createdAt: new Date(),
  visitCount: 10,
};
```
- MUST reuse the same word for the same concept (`getUser`, not `getUserInfo` / `getUserData`).
- SHOULD avoid redundant context (`TodoCard.todoTitle` → `TodoCard.title`).

### Functions & Control Flow
```ts
// Bad
function between(value: number, left: number, right: number) {
  if (left > value) {
    return false;
  } else {
    if (value > right) {
      return false;
    }
  }
  return true;
}

// Good
function isWithinRange(value: number, min: number, max: number) {
  if (value < min) return false;
  if (value > max) return false;
  return true;
}
```
- MUST return early instead of nesting branches.
- SHOULD keep functions under ~20 lines; extract helpers when branching grows complex.

### Objects & Data Structures
```ts
type Subscription = {
  id: string;
  renewsAt: Date;
  status: 'trial' | 'active' | 'past_due';
};

const subscriptionById = new Map<string, Subscription>();

for (const [id, subscription] of subscriptionById) {
  // use descriptive variable names
}
```
- MUST type maps and collections explicitly; avoid `any` and implicit `Object` usage.
- SHOULD keep DTOs small and move derived values into selectors/utilities.

### Error Handling & Messaging
```ts
throw new Error('Password must include upper, lower, digit, special characters, and be 12+ chars');
```
- MUST throw descriptive `Error`s (or domain-specific errors) so catchers can map them to UX.
- SHOULD prefer `Result`-style objects or discriminated unions when a function can legitimately fail.

### Formatting, Comments & Intent
- MUST rely on Prettier (or the project formatter) and avoid hand-aligned whitespace.
- SHOULD reserve comments for intent, rationale, or gotchas; delete self-evident narration.
- MUST keep TODOs scoped to follow-up issues and include owner + link.

Adhering to these extended practices keeps the TypeScript codebase searchable, testable, and easier to maintain at scale.

## Appendix: Snippet Library

- TanStack Query typed API + optimistic update — see [Frontend/Data Fetching (TanStack Query)](#data-fetching-tanstack-query).
- RHF + Zod form wiring — see [Frontend/Forms (React Hook Form + Zod + shadcn/ui)](#forms-react-hook-form--zod--shadcnui).
- Zustand feature store with persistence — see [Frontend/State Management (TanStack Query + Zustand)](#state-management-tanstack-query--zustand).
- React Router guard pattern — see [Frontend/Routing (React Router 6)](#routing-react-router-6).
- Error boundary + skeleton state — see [Frontend/Error Handling & UX](#error-handling--ux).
- SQLModel entity + Alembic revision — see [Backend/Data Modeling & Migrations (SQLModel + Alembic)](#data-modeling--migrations-sqlmodel--alembic).
- Dependency chain with thin router — see [Backend/Routers, Dependencies, Services](#routers-dependencies-services).
- Playwright config and journey — see [Testing/End-to-End (Playwright)](#end-to-end-playwright).
- httpx.AsyncClient example — see [Testing/Unit, Integration, API Contract](#unit-integration-api-contract).
- uv + Ruff commands — see [CI/CD & Deployment/uv Everywhere](#uv-everywhere) and [CI/CD & Deployment/Ruff via uv](#ruff-via-uv).
- Compose watch + static SPA profiles — see [Frontend/Build & Dev Loop (Vite + Compose Watch)](#build--dev-loop-vite--compose-watch) and [CI/CD & Deployment/Builds & Environments](#builds--environments).
