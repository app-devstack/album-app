# Album app — style and conventions

## Language & tooling
- **TypeScript** (strict usage encouraged; note `typescript.ignoreBuildErrors` in Next config — fix before prod).
- **Tailwind CSS v4**, `cn()` from `@/lib/utils`, **next-themes**, Noto Sans JP / Noto Serif JP.
- **Import aliases**: `@/components`, `@/lib`, `@/db`, `@/hooks`.

## UI
- **shadcn/ui** (New York style), Radix primitives.

## API / server
- Hono: `createApp()`, `zValidator` + Zod for input.
- Validate at route boundaries; keep Worker-safe code (no Node-only modules).

## Data fetching (client)
- TanStack Query v5; hooks in `src/hooks/fetchers/`; query keys like `albumKeys`.

## Commits (project rule)
- **Japanese** one-line title; prefixes: `fix`, `add`, `update`, `change`, `clean`, `remove`, `upgrade`, `revert`, `hotfix`, `disable`.

## Schema / migrations
- Edit `src/db/schema.ts` → `pnpm db:generate` → `pnpm db:migrate` (add `--remote` for prod) → `pnpm run cf-typegen`.

## Large tasks
- Optional: `.prompts/NN_task-name/impl-guide.md` + English `impl-report.md` after completion.
