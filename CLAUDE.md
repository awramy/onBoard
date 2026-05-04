# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Язык

Все ответы пользователю — на русском языке. Комментарии в коде и содержимое `.md`-файлов — также на русском.

## Project Overview

**onBoard** is an AI-powered interview preparation platform. Users select a technology + difficulty level, then answer AI-generated interview questions in a session. The system tracks per-question mastery, topic progress, and assigns user leagues (bronze/silver/gold/platinum).

Monorepo layout:
- `backend/` — NestJS 11 REST API (port 3000)
- `frontend/` — Vite + React 19 SPA (port 5173)

## Services

| Service | Required | How to start |
|---------|----------|-------------|
| PostgreSQL 16 | Yes | `sudo docker compose up -d postgres` (repo root) |
| Redis 7 | Yes | `sudo docker compose up -d redis` (repo root) |
| Backend | Yes | `pnpm run start:dev` (from `backend/`) |
| Frontend | Yes | `pnpm run dev` (from `frontend/`, proxies `/api` to backend) |

On the dev VM: start Docker daemon first with `sudo dockerd &` before `docker compose up`. It uses `fuse-overlayfs` and `iptables-legacy`.

## Commands

### Backend (`backend/`)
```bash
pnpm run start:dev        # Dev server with watch
pnpm run build            # Compile to dist/
pnpm run lint             # ESLint + fix
pnpm run test             # Jest unit tests
pnpm run test:e2e         # E2E tests
pnpm run test -- --testPathPattern=sessions  # Run a single test file

npx prisma generate       # Regenerate Prisma client (after reinstall or migration)
npx prisma migrate deploy # Apply pending migrations
npx tsx prisma/seed.ts    # Seed DB with technologies, topics, questions
```

Swagger docs available at `http://localhost:3000/api/docs` when backend is running.

### Frontend (`frontend/`)
```bash
pnpm run dev              # Dev server
pnpm run build            # Production build
pnpm run lint             # ESLint
pnpm run orval:generate   # Regenerate API client from OpenAPI spec
pnpm run api:gen:watch    # Watch + auto-regenerate API client
```

## Architecture

### Backend

NestJS 11 monolith with feature modules. Each module lives in `src/<feature>/` and exports its service if needed by other modules.

**Key modules:**
- `auth/` — JWT registration/login via `passport-jwt`
- `sessions/` — Core interview flow: create → start → answer/skip → finish/abandon
- `ai/` — `@Global` module. `AiService` is a facade over `GeminiProvider` and `OpenAiProvider`. Provider selected from `session.config.model`; `"auto"` picks Gemini → OpenAI. Providers degrade gracefully if the API key is absent.
- `progress/` — Reusable service for `UserQuestionProgress` and `UserTopicProgress`. Imported by `SessionsModule`.
- `questions/`, `topics/`, `technologies/` — Catalog management
- `users/` — User profile
- `prisma/` — Global `PrismaService`
- `common/` — Guards, decorators, `PaginationDto`, `localize()` utility

**Prisma 7 specifics:**
- Uses `@prisma/adapter-pg` driver adapter (not the legacy `datasources` option).
- Import PrismaClient from `@prisma/client` (NOT `.prisma/client`).
- `prisma.config.ts` provides URL for migrations; runtime client reads `process.env.DATABASE_URL` via the adapter.
- After schema changes: `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate reset --force` for dev.

**Environment variables** (`backend/.env`): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GEMINI_MODEL`, `OPENAI_MODEL`.

### Frontend

Vite + React 19 SPA. No backend calls happen without the backend running (Vite proxies `/api`).

**Key directories:**
- `src/features/` — Feature modules (auth, dashboard, session-chat, progress, etc.)
- `src/api/` — Auto-generated OpenAPI TypeScript client (via Orval). Regenerate with `pnpm run orval:generate` when the backend API changes.
- `src/stores/` — Zustand state
- `src/routes/` — React Router v6 config
- `src/i18n/` — i18next setup + locale files

## Key Patterns & Caveats

**i18n fields**: `Technology.description`, `Topic.name`/`description`, `Question.text`/`explanation` are Prisma `Json` type with `{en: "...", ru: "..."}` structure. Always use `localize()` from `common/utils/i18n.ts`. `Technology.name` is plain `VARCHAR`.

**Pagination**: All list endpoints support `?skip=0&take=50` via `PaginationDto`.

**UUID validation**: Required query/path params on session endpoints use `ParseUUIDPipe`.

**Session flow**:
1. `POST /sessions` — create (status: `planned`)
2. `POST /sessions/:id/start` — generate questions, status → `in_progress`
3. `GET /sessions/:id/current-question` — get active question
4. `POST /sessions/:id/answer` — AI evaluates, updates mastery, advances; returns `{ answerId, score, feedback, isFullyClosed, isFinished, nextQuestion? }`
5. `POST /sessions/:id/skip` — score=0, advances
6. Session auto-completes after last question. Manual: `POST /sessions/:id/finish` (computes avgScore, updates `User.fullScore`, recalculates league) or `POST /sessions/:id/abandon` (preserves progress).

**League thresholds**: bronze < 100, silver < 500, gold < 1000, platinum ≥ 1000 (`User.fullScore`).

**QuestionGeneratorService** (`sessions/question-generator.service.ts`): round-robin across topics from unanswered questions, falls back to lowest-mastery.

**AI models**: Gemini uses `gemini-2.0-flash` (`@google/genai`); OpenAI uses `gpt-4o-mini` (`openai`). `AiService.evaluateAnswer()` receives full context: question, explanation, `isDivide`, previous answers, mastery.
