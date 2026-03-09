# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

"onBoard" is an AI-powered interview preparation service. The backend is a NestJS 11 monolith (`backend/`) with Prisma 7, JWT auth, and PostgreSQL. The frontend is a Vite + React 19 SPA (`frontend/`) with Tailwind CSS, Zustand, and React Router v6.

### Services

| Service | Required | How to start |
|---------|----------|-------------|
| PostgreSQL 16 | Yes | `sudo docker compose up -d postgres` (from repo root) |
| Redis 7 | Yes | `sudo docker compose up -d redis` (from repo root) |
| Backend (NestJS) | Yes | `pnpm run start:dev` (from `backend/`, port 3000) |
| Frontend (Vite) | Yes | `pnpm run dev` (from `frontend/`, port 5173, proxies `/api` to backend) |

### Key caveats

- **Docker daemon**: Must be started with `sudo dockerd &` before `docker compose up`. The VM uses `fuse-overlayfs` storage driver and `iptables-legacy`.
- **Prisma 7 driver adapter**: PrismaClient uses `@prisma/adapter-pg` (not the legacy `datasources` option). Import from `@prisma/client` (NOT `.prisma/client`). `prisma.config.ts` provides the URL for migrations; runtime client gets its connection from `process.env.DATABASE_URL` via the adapter.
- **Prisma migrations**: Run `npx prisma migrate deploy` from `backend/` after DB is up. If schema changed after rebase, use `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate reset --force` for dev DB.
- **Prisma client generation**: Run `npx prisma generate` from `backend/` if `node_modules` are reinstalled or after migration.
- **Environment variables**: `backend/.env` has all needed vars (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`, `GEMINI_API_KEY`, `OPENAI_API_KEY`).
- **Seed data**: Run `npx tsx prisma/seed.ts` from `backend/` to populate technologies, topics, and questions (uses JSON i18n format).
- **Frontend proxy**: Vite dev server proxies `/api` requests to `http://localhost:3000`, so backend must be running for the frontend to work.
- **i18n fields**: `Technology.description`, `Topic.name`/`description`, `Question.text`/`explanation` are `Json` type with `{en: "...", ru: "..."}` structure. Use `localize()` from `common/utils/i18n.ts`. `Technology.name` is plain `VARCHAR` (not JSON).
- **Pagination**: All list endpoints support `?skip=0&take=50` via `PaginationDto` from `common/dto/pagination.dto.ts`.
- **UUID validation**: Required query params (`topicId`, `levelId`, `technologyLevelId`) and path params on session endpoints use `ParseUUIDPipe` for runtime validation.
- **Session flow**: `POST /sessions` (create, status=planned) → `POST /sessions/:id/start` (generates questions, status=in_progress) → `GET /sessions/:id/current-question` → `POST /sessions/:id/skip` (score=0, advances). Session auto-completes when last question is skipped.
- **ProgressModule**: Reusable service at `backend/src/progress/` for reading/writing `UserQuestionProgress` and `UserTopicProgress`. Used by SessionsModule (skip, future answer). Exported and importable by any module.
- **QuestionGeneratorService**: Located in `backend/src/sessions/question-generator.service.ts`. Round-robin selection across topics from unanswered questions, fallback to lowest-mastery.
- **AiModule**: `@Global` module at `backend/src/ai/`. Exports `AiService` — facade for AI providers. Supports `GeminiProvider` (`@google/genai`, model: `gemini-2.0-flash`) and `OpenAiProvider` (`openai`, model: `gpt-4o-mini`). Dynamic provider selection via `AiService.getProvider(modelName)`: `"auto"` picks first available (Gemini → OpenAI). Providers gracefully degrade if API key is not set. Env vars: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GEMINI_MODEL`, `OPENAI_MODEL`.

### Standard commands

**Backend** (from `backend/`): see `backend/package.json` scripts.
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Test (unit): `pnpm run test`
- Test (e2e): `pnpm run test:e2e`
- Dev server: `pnpm run start:dev`
- Swagger docs: `http://localhost:3000/api/docs`

**Frontend** (from `frontend/`): see `frontend/package.json` scripts.
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Dev server: `pnpm run dev`
