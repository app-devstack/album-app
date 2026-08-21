# Web API / data

## Mount
- Hono at `src/app/api/[[...route]]/route.ts` (`createApp()`, base `/api`).
- Routes: auth, native-oauth-handoff, albums, groups, join, download, photos, memos, profile.
- Client: `import { api } from '@/lib/api'` (typed `hc`, `credentials: 'include'`).

## Authz
- Session: Better Auth cookies. Native uploads also send bearer (`bearer` plugin); web syncs token via `SESSION_TOKEN`.
- New login gates: `requireSessionUser404` → **404** `{ error: 'Not found' }` (not 401). Some older groups/join routes still 401 — do not unify unless asked.
- Resource denial: **403** Forbidden. Missing resource: **404**.
- More specific paths (e.g. `/:id/cover-optimized`) before generic `/:id`.

## Data
- `src/db/index.ts`: `drizzle(env.DB)`. Types: `typeof table.$inferSelect`.
- `albums.type`: `personal` | `family`. Family sharing is `groupId` + `group_members` (roles `owner` / `editor` / `member`). Do not assume a `sharedWith` column (stale in some docs; albums API zod may still mention it).
- `photos.mediaType`: `image` | `video`; videos have `duration`. photos/memos CASCADE with album.
- R2: presigned PUT; photos store `r2Key`. Client uploads direct to R2 then POST metadata.

## Native OAuth (web side)
- Login/signup `callbackURL: '/'` (stay on https inside the WebView).
- `trustedOrigins` includes `album://*`. Plugin may copy Set-Cookie onto `album://` Location; `/api/native-oauth-handoff` sets cookies and redirects to `/albums`.
- Do not make production web navigate the WebView to `album://oauth` — causes `ERR_UNKNOWN_URL_SCHEME`. Native already intercepts non-http nav.
