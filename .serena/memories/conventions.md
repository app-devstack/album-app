# Conventions

## Language
- TypeScript. Fix type errors before prod (`typescript.ignoreBuildErrors` is on in Next — do not rely on it).
- JSDoc (Japanese) on exported functions / components / hooks. Exported types: one-line title. Complex props: trailing `//`, not JSDoc above each field.
- Files named `constants` / `const`: static values only — no functions or hooks (put those in utils/helpers).
- Import aliases: `@/components`, `@/lib`, `@/db`, `@/hooks`.

## UI
- Tailwind v4 + `cn()`. Dialogs follow `DESIGN.md` §1.
  - 2 actions: left dismiss (`ghost` キャンセル/閉じる) / right confirm. `flex-row justify-between gap-2`. Not `justify-end`, not `flex-col-reverse`.
  - Destructive confirm dismiss: never 「やめる」. Never pair 「キャンセル」 with 「取り消す」 as the confirm — use 「削除」 for confirm even when the action is cancel-upload.
  - Destructive `DropdownMenuItem`: `DropdownMenuSeparator` immediately before.
- Multi-dialog screens: `{/* 〇〇用ダイアログ */}` comment before each.
- Do not delete unused shadcn under `src/components/ui/`.
- Native colors: `APP_COLORS` (`primary` = sakura pink CTA). Do not name tokens 和紙/墨/login-only.

## Git
- Commit title Japanese, prefix `fix|hotfix|add|update|change|clean|disable|remove|upgrade|revert`.
- Do not commit unless asked. Do not push unless the user explicitly says to push/remote.
- `.serena/` (minus `cache`) is versioned. Do not commit memories from other projects.
- Ignore: `apps/native/ios`, `apps/native/android`, `local/*`, APK/IPA under `build/`.
- Confirm-only questions (「〜になってる？」): do not edit code; answer then ask.

## Docs
- `docs/このアプリについて.md`: requirements only. Implementation prompts go in `local/` (gitignored).
