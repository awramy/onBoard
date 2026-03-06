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
- **Prisma 7 driver adapter**: PrismaClient uses `@prisma/adapter-pg` (not the legacy `datasources` option). `prisma.config.ts` provides the URL for migrations; runtime client gets its connection from `process.env.DATABASE_URL` via the adapter.
- **Prisma migrations**: Run `npx prisma migrate deploy` from `backend/` after DB is up.
- **Prisma client generation**: Run `npx prisma generate` from `backend/` if `node_modules` are reinstalled.
- **Environment variables**: `backend/.env` has all needed vars (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`).
- **Seed data**: Run `npx tsx prisma/seed.ts` from `backend/` to populate technologies, topics, and questions.
- **Frontend proxy**: Vite dev server proxies `/api` requests to `http://localhost:3000`, so backend must be running for the frontend to work.

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
