# Task completion

1. `pnpm lint` and fix.
2. `pnpm type-check` (web). If `apps/native` changed: `cd apps/native && pnpm type-check`.
3. Schema or wrangler bindings changed: `pnpm db:generate` / `pnpm db:migrate` as needed + `pnpm run cf-typegen`.
4. Touch Workers / R2 / D1: smoke in `pnpm dev:vinext`. Touch native upload / OAuth / insets: needs a real native build (`pnpm native:build:*`). If the WebView loads production origin, web changes need `pnpm deploy:vinext` before they take effect on device.
5. No root `test` script — run tests only if added.
6. Remove debug instrumentation (console/fetch logs, agent log regions) before considering done.
