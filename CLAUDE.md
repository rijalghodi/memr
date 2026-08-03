# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memr is a local-first, Notion-like, AI-powered knowledge manager (notes, tasks, projects/collections) with a context-aware AI chat assistant. It is a monorepo with two independent apps:

- **`api/`** — Go (Fiber) REST API backed by PostgreSQL/GORM
- **`web/`** — React 19 + Vite PWA frontend, local-first via Dexie (IndexedDB), syncing to the API

## Commands

### Frontend (`web/`)

Uses `pnpm`. Run all commands from `web/`.

```bash
pnpm dev            # start dev server
pnpm build           # production build (tsc -b && vite build)
pnpm typecheck       # tsc --noEmit
pnpm lint            # eslint
pnpm lint:fix        # eslint --fix && prettier --write .
pnpm test            # vitest (watch mode)
pnpm test:run        # vitest run (single pass, CI-style)
pnpm test:run -- path/to/file.test.ts   # run a single test file
pnpm test:coverage
```

Add shadcn components with `pnpm dlx shadcn@latest add <component>` rather than hand-writing them; they land in `web/components/ui`.

### Backend (`api/`)

Uses `make` + Go. Run all commands from `api/`. Requires a local `.env` (see `api/README.md`).

```bash
make start                       # go run main.go http
air                               # hot-reload dev server (requires Air installed)
make swagger                      # regenerate Swagger docs into api/docs
make migration-<name>             # scaffold a new SQL migration in internal/database/migrations
make migrate-up <number>          # apply migrations
make migrate-down <number>        # revert migrations
make docker / docker-down / docker-cache
lint: golangci-lint run
go test ./...                     # run all tests
go test ./internal/usecase/... -run TestName   # run a single test
```

## Architecture

### Frontend: local-first data + sync

- Local data lives in IndexedDB via Dexie (`web/lib/dexie.ts`, db name `memr`), with tables for `tasks`, `projects`, `notes`, `collections`, `settings`. Every entity carries `createdAt`/`updatedAt`/`deletedAt`/`syncedAt`; deletes are soft (`deletedAt` set, never removed locally) so they can propagate on sync.
- `web/service/local/api-*.ts` (e.g. `api-note.ts`, `api-task.ts`, `api-project.ts`, `api-collection.ts`) are the CRUD layer that reads/writes Dexie directly and exposes React Query-free hooks built on `dexie-react-hooks`' `useLiveQuery` (so UI reactively updates on local DB changes, no manual invalidation).
- `web/service/api-*.ts` (no `local/`) are the real backend HTTP clients (axios via `web/service/api-client.ts`), used for auth, chat, and sync — not for note/task/project/collection CRUD, which is Dexie-only until synced.
- `web/service/api-sync.ts` pushes local unsynced changes and pulls remote changes through a single `POST /v1/sync` endpoint, reconciled by comparing `updatedAt` vs `syncedAt` timestamps. Sync cadence/timing is controlled by `VITE_SYNC_INTERVAL`, `VITE_SYNC_GRACE_PERIOD`, `VITE_AUTOSAVE_INTERVAL` env vars.
- `web/service/api-client.ts` is the single axios instance: attaches the JWT from cookies to every request and transparently refreshes on 401 (queuing concurrent requests during refresh).

### Frontend: app structure

- No `src/` directory — app code sits directly under `web/` (`components/`, `pages/`, `hooks/`, `lib/`, `service/`). Path alias `@` resolves to `web/` (see `vite.config.ts` and `tsconfig.json`).
- Routing is React Router (`web/App.tsx`), with route paths centralized in `web/lib/routes.ts` (`ROUTES` map + `getRoute`/`extractRoute` helpers for building/parsing param routes). Auth-only and guest-only route groups are gated by `AuthGuard` (`web/components/layouts/auth-guard.tsx`), not per-page checks.
- Page components in `web/pages/*.tsx` use named exports (e.g. `export function NotesPage()`), not default exports — follow this convention for new pages/components.
- Feature components are organized by domain under `web/components/<feature>/` (`notes`, `tasks`, `projects`, `collections`, `chat`, `tiptap`, `sync`, ...); shared primitives live in `web/components/ui` (ShadCN, `new-york` style, icons from `lucide-react`).
- Rich text editing uses TipTap (`web/components/tiptap/`), data fetching/mutation against the real API uses React Query + axios, forms use `react-hook-form`.
- It's a PWA (`vite-plugin-pwa`, configured in `vite.config.ts`) with offline caching strategies per asset type.

### Backend: layered architecture

Standard handler → usecase → repository → model layering, wired manually (no DI framework) in `api/internal/app/injector.go`:

- `internal/handler` — Fiber route handlers (HTTP layer), one per feature (`auth_handler.go`, `chat_handler.go`, `sync_handler.go`, ...)
- `internal/usecase` — business logic, takes repositories (and other usecases) as constructor deps
- `internal/repository` — GORM data access
- `internal/model` — GORM models
- `internal/contract` — request/response DTOs
- `internal/agent` — the AI chat agent (`agent.go`), its tool-calling implementation (`tools.go`), and its own data access (`repository.go`); wired into `chat_usecase` via `agent.NewAgent(openaiClient, toolExecutor)`
- `internal/middleware` — Fiber middleware, including `auth.go` (JWT bearer auth)
- `internal/config`, `pkg/logger`, `pkg/postgres`, `pkg/openai`, `pkg/firebase`, `pkg/util` — cross-cutting infra (env config, Zap logger, Postgres/GORM setup, OpenAI client, Firebase auth, shared error/validation utilities)
- `cmd/` — cobra-style commands (`http.go` serves the API, `migrate.go` runs migrations); `main.go` is the entry point

Auth: Firebase Authentication (magic link / Google) plus first-party JWT access + refresh tokens (`JWT_ACCESS_EXP_MINUTES` default 30 min, `JWT_REFRESH_EXP_DAYS` default 30 days). Protect routes with the `Auth` middleware in `internal/middleware/auth.go`. Firebase is optional at boot — if not configured, email/magic-link login is disabled but the server still starts (see `injector.go`).

Error handling: return `fiber.NewError(code, message)` from usecases/handlers; the centralized error handler formats it as `{"code", "status", "message"}` and Fiber's recover middleware guards against panics. Request validation uses struct tags via `go-playground/validator`, wired through `pkg/util/validator.go`.
