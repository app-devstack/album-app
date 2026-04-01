# Album app — project overview

## Purpose
Full-stack **photo/album** web app: albums (personal/family), photos (image/video via R2), memos, groups and invites. Auth via Better Auth.

## Runtime / deployment
- **Next.js 16** (App Router) + **React 19** on **Cloudflare Workers via Vinext** — not standard Node hosting.
- SSR runs in a Worker: **no Node.js APIs** at runtime.
- **API**: Hono mounted at `src/app/api/[[...route]]/route.ts`, split under `routes/` (albums, photos, memos, groups, auth, etc.).
- **DB**: Cloudflare **D1** + Drizzle (`src/db/`, `env.DB`).
- **Storage**: **R2** with presigned URLs (`src/lib/r2.ts`, photos routes).
- **Images**: `next/image` unoptimized-style; optimization via worker `/_vinext/image` (Cloudflare Images).

## Rough `src/` layout
- `app/` — App Router pages: `(app)/`, `(auth)/`, `api/[[...route]]/`
- `components/` — pages, album UI, layout, shadcn `ui/`
- `hooks/fetchers/` — TanStack Query v5 + `albumKeys` pattern
- `lib/` — api client, auth, services, utils
- `db/` — schema, Drizzle entry
- `constants/`, `contexts/`, `stores/`, `middleware.ts`

## Client API
- `import { api } from '@/lib/api'` — typed Hono client.

## Long-form docs
- `.github/copilot-instructions.md`, `CLAUDE.md` in repo root.
