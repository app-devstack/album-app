# Album (思い出帳)

Family shared photo album. Web app + Expo WebView native shell.

## Layout
- `src/` — Next.js App Router web + Hono API
- `apps/native/` — Expo 57 CNG WebView shell (own `package.json` / `pnpm-lock.yaml`; not a pnpm workspace of the root)
- `apps/native/modules/wifi-constrained-uploader/` — local Expo native module (Wi-Fi-constrained background upload)
- `worker/` — Vinext Cloudflare Worker entry (`/_vinext/image`)
- `drizzle/` — D1 migrations (must match wrangler `migrations_dir`)
- `docs/native-build.md` — APK/IPA via root scripts only
- `DESIGN.md` — dialog footer / copy rules
- `docs/このアプリについて.md` — product requirements for third-party AIs; never put implementation/work requests here

## Invariants
- Runtime is Cloudflare Workers (Vinext). No Node.js APIs in SSR/API unless Workers-compatible (`nodejs_compat` is on).
- Package manager: **pnpm only** (no npm/yarn/bun).
- Native `ios/` and `android/` are generated (CNG) and gitignored. Edit `App.tsx` / `app.config.ts` / config plugins, not generated native files.
- Git: never `git push` / remote publish unless the user explicitly asks. Commit only when asked.
- Destructive env ops (`rm -rf node_modules`, store prune, `git clean -fdx`) need explicit OK.

## See also
- languages, frameworks, pins: `mem:tech_stack`
- commands to actually run: `mem:suggested_commands`
- style, UI copy, JSDoc, git: `mem:conventions`
- done-checklist: `mem:task_completion`
- Hono / D1 / R2 / Better Auth: `mem:web/api`
- Expo WebView, OAuth, system bars, build: `mem:native/core`
- upload queue and pending cells: `mem:native/upload`
