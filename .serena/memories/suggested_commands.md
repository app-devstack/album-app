# Commands (Darwin)

## Web (repo root)
- `pnpm dev` — Next.js http://localhost:3000
- `pnpm dev:vinext` — Vinext/CF emulation :3001 (prefer when touching Workers / D1 / R2)
- `pnpm build` / `pnpm build:vinext` / `pnpm deploy:vinext`
- `pnpm lint` / `pnpm type-check` / `pnpm format`
- `pnpm db:generate` → `pnpm db:migrate` (local D1 `album-app-db`) / `pnpm db:migrate:remote`
- `pnpm run cf-typegen` after wrangler binding changes
- `pnpm run secrets:upload`
- `pnpm db:seed:dev`

## Native
- `pnpm native:build:android` / `pnpm native:build:ios` — **only** way to produce release APK/IPA (dated copies under repo `build/`)
- Do not hand over raw `gradlew` / `xcodebuild` intermediates
- Dev: `cd apps/native && pnpm start` / `pnpm android` / `pnpm ios` (Expo Go unusable; custom native module)
- Native typecheck: `cd apps/native && pnpm type-check`

## Darwin
- `rg` available; other unix tools are standard
