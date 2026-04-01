# When a coding task is finished

1. Run **`pnpm lint`** and fix ESLint issues.
2. Run **`pnpm type-check`** and fix TypeScript errors (do not rely on `ignoreBuildErrors` for production readiness).
3. If DB schema or `wrangler.jsonc` bindings changed: run **`pnpm db:generate`** / **`pnpm db:migrate`** as appropriate and **`pnpm run cf-typegen`**.
4. Manually exercise critical flows in **`pnpm dev`** or **`pnpm dev:vinext`** when the change touches Workers, R2, or D1.
5. No automated test script is wired in `package.json` yet — run project-specific tests if added later.
