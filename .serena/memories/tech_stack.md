# Tech stack

## Web (repo root)
- Next.js 16 App Router, React 19, Vinext on Cloudflare Workers
- Hono + `@hono/zod-validator` + Zod 4
- Drizzle + D1 (`env.DB`); R2 via AWS SDK v3 presigned URLs (`env.R2`)
- Better Auth (drizzle sqlite adapter, `bearer` plugin, Google + email/password)
- TanStack Query v5 (`src/hooks/fetchers/`, `albumKeys`)
- shadcn/ui New York, Tailwind v4, next-themes, Noto Sans JP / Noto Serif JP
- Zustand, date-fns, uuid present

## Native (`apps/native`)
- Expo SDK 57, React Native 0.86, `react-native-webview`
- Expo modules: image-picker, file-system, network, notifications, secure-store, video-thumbnails, image-manipulator, web-browser, dev-client
- Local module `wifi-constrained-uploader` (`file:./modules/wifi-constrained-uploader`)

## Tooling
- pnpm (root and native each have their own lockfile)
- wrangler, drizzle-kit, vinext/vite
- TypeScript 5.7 (web), ~6 (native)
- ESLint + Prettier; `knip` for unused exports
- No automated test script in root `package.json`
