# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

"onBoard" is an AI-powered interview preparation service. The backend is a NestJS 11 app with Prisma 7, JWT auth, and PostgreSQL. A React frontend exists in `frontend/`.

### Services

| Service | Required | How to start |
|---------|----------|-------------|
| PostgreSQL | Yes | `docker compose up -d postgres` (from repo root) |
| Backend (NestJS) | Yes | `pnpm run start:dev` (from `backend/`) |
| Redis | Optional | `docker compose up -d redis` (from repo root) |

### Key caveats

- **Docker daemon**: Must be started with `sudo dockerd` before `docker compose up`. After starting, fix socket permissions: `sudo chmod 666 /var/run/docker.sock`.
- **Prisma 7 driver adapter**: PrismaClient uses `@prisma/adapter-pg` (not the legacy `datasources` option). The `prisma.config.ts` provides the URL for migrations only; the runtime client gets its connection string from `process.env.DATABASE_URL` via the adapter.
- **Prisma migrations**: Run `npx prisma migrate deploy` from `backend/` after DB is up.
- **Prisma client generation**: Run `npx prisma generate` from `backend/` if `node_modules` are reinstalled.
- **Environment variables**: `backend/.env` has all needed vars (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`).

### Standard commands (from `backend/`)

See `backend/package.json` scripts:
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Test (unit): `pnpm run test`
- Test (e2e): `pnpm run test:e2e`
- Dev server: `pnpm run start:dev`
- Swagger docs: `http://localhost:3000/api/docs`
