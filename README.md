# VidphoAI — frontend

This is the public frontend for VidphoAI: the Next.js UI (auth pages, project dashboard, upload, manual timeline editor). It talks to a separate, private backend API over HTTP — it has no direct database, storage, or render-pipeline access of its own.

- `apps/web` — the Next.js app.
- `packages/edit-schema` — the shared EditPlan zod schema/types.
- `packages/remotion-composition` — the Remotion composition used for the live in-browser preview (`@remotion/player`). The backend's render worker renders the exact same composition server-side from its own copy of this package — the two are kept manually in sync for now; if they start to drift, extracting this (and `edit-schema`) into a small published npm package is the fix, since neither contains any secrets.

## Setup

1. `cd apps/web && cp .env.local.example .env.local` and set `NEXT_PUBLIC_API_URL` to your backend's URL (e.g. `http://localhost:4000` for local dev, or `https://api.yourdomain.com` in production).
2. From the repo root: `pnpm install`
3. `pnpm dev` — runs the web app (default `http://localhost:3000`).

You'll need the backend (separate private repo) running too, with its `FRONTEND_ORIGIN` env var set to match wherever this app is served from — the backend's CORS middleware only allows credentialed requests from an exact origin match.

## Auth model

Login/session state is NOT handled by `next-auth/react` here, because the backend lives on a different origin than this app. `lib/authClient.ts` talks to the backend's NextAuth REST endpoints directly (`/api/auth/csrf`, `/api/auth/callback/credentials`, `/api/auth/session`) with `credentials: 'include'`, and `lib/AuthProvider.tsx` wraps that in a React context (`useAuth()`) that mirrors `useSession()`'s shape (`status`, plus `login`/`logout`). All API calls should go through `lib/apiClient.ts`'s `apiFetch()`, which prefixes `NEXT_PUBLIC_API_URL` and sets `credentials: 'include'`.

Cross-origin cookies work here because the frontend and backend are meant to live on subdomains of the same registrable domain (e.g. `app.yourdomain.com` / `api.yourdomain.com`) — that makes the session cookie's default `SameSite=Lax` sufficient (no `SameSite=None`/third-party-cookie complexity needed), since subdomains of one domain count as the same "site" for that purpose.

## Known limitations of this slice

- No chat/AI editing yet (Phase 2).
- No generative AI provider integrations yet (Phase 2, requires your own API keys on the backend).
- Remotion is used under its free tier terms for now — revisit its company licensing before any commercial launch.
