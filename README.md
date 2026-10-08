# AI Video/Photo Editor

Monorepo (pnpm + Turborepo):

- `apps/web` — Next.js app: auth, project dashboard, upload, manual timeline editor (chat-driven AI editing lands in Phase 2).
- `apps/render-worker` — Node/BullMQ worker that renders an EditPlan to MP4 via Remotion.
- `apps/analysis-service` — Python/FastAPI stub (scene/beat detection lands in Phase 2).
- `packages/edit-schema` — shared EditPlan zod schema/types.
- `packages/remotion-composition` — the Remotion composition rendered both live in-browser (`@remotion/player`) and server-side (`@remotion/renderer`) from the same EditPlan.
- `packages/db` — Prisma schema + client, shared by `apps/web` and `apps/render-worker`.
- `packages/storage` — S3-compatible storage helpers (presigned upload/download).

## Setup

1. `cp .env.example .env` and adjust if needed (defaults match the Docker services below).
2. `docker compose up -d` — starts Postgres, Redis, and LocalStack (S3-compatible storage). Notes:
   - MinIO's Docker Hub images now require a paid subscription to pull, so this project uses LocalStack's S3 emulation for local dev instead.
   - LocalStack is pinned to `3.0.2` because newer tags require a `LOCALSTACK_AUTH_TOKEN` license.
   - Redis is mapped to host port `6380` (not the default `6379`) to avoid clashing with any other local Redis container.
3. `pnpm install`
4. `pnpm setup:bucket` — creates the S3 bucket in LocalStack (no AWS CLI required).
5. `pnpm db:generate` then `pnpm db:migrate` (applies the Prisma schema to Postgres).
6. `pnpm dev` — runs the web app (http://localhost:3000) and the render worker together.

## Manual test (Phase 1 slice)

1. Register an account, sign in, create a project.
2. Upload a short video, a photo, and an audio file.
3. Drag/add them onto the timeline; trim a clip; add a text overlay.
4. Confirm the live preview updates.
5. Click Export, wait for the render worker to finish, download the MP4, and confirm it matches the preview.

## Known limitations of this slice

- No chat/AI editing yet (Phase 2).
- No generative AI provider integrations yet (Phase 2, requires your own API keys).
- No real scene/beat detection yet (`analysis-service` is a health-check stub).
- Remotion is used under its free tier terms for now — revisit its company licensing before any commercial launch.
