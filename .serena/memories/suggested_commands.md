# Album app — suggested commands

## Run the app
- `pnpm dev` — Next.js dev server (http://localhost:3000)
- `pnpm dev:vinext` — Cloudflare/Vinext emulation (port 3001)
- `pnpm build` / `pnpm start` — production Next build and start
- `pnpm build:vinext` / `pnpm deploy:vinext` — Workers build and deploy (production env via dotenv)

## Quality gates (after changes)
- `pnpm lint` — ESLint
- `pnpm type-check` — `tsc --noEmit`

## Database (D1 + Drizzle)
- `pnpm db:generate` — drizzle-kit generate migrations
- `pnpm db:migrate` — apply to local D1 binding `album-app-db`
- `pnpm db:migrate:remote` — apply to remote D1
- `pnpm run cf-typegen` — regenerate `worker-configuration.d.ts` after binding changes

## Other
- `pnpm run secrets:upload` — upload secrets (script)
- `pnpm db:seed:dev` — seed dev user (`tsx scripts/seed-dev-user.ts`)

## Package manager
- Use **pnpm** (not npm/yarn in docs).

## System
- Developed on **Darwin** (macOS); usual shell tools: `git`, `ls`, `cd`, `grep`, `find`, `rg` if installed.

## Tests
- No `test` script in `package.json` currently; add/run when introduced.
