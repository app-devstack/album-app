# 思い出帳 — テーマ・スタイルガイドライン

このドキュメントは、思い出帳プロジェクトにおけるテーマ定義・維持・拡張のためのリファレンスです。
新規ページ・コンポーネント開発時は必ずこのガイドラインに従ってください。

---

## 目次

1. [テーマの構成概要](#1-テーマの構成概要)
2. [カラートークン](#2-カラートークン)
   - [2-1. 基本トークン（shadcn/ui 系）](#2-1-基本トークンshadcnui-系)
   - [2-2. ログイン系トークン（公開ページ共通）](#2-2-ログイン系トークン公開ページ共通)
3. [アクセントカラーシステム](#3-アクセントカラーシステム)
4. [タイポグラフィ](#4-タイポグラフィ)
5. [ページ種別とテーマの使い分け](#5-ページ種別とテーマの使い分け)
6. [公開ページのレイアウト構造](#6-公開ページのレイアウト構造)
7. [共有コンポーネント](#7-共有コンポーネント)
8. [新規ページ追加チェックリスト](#8-新規ページ追加チェックリスト)
9. [禁止事項](#9-禁止事項)

---

## 1. テーマの構成概要

テーマは **2 層構造** で成り立っています。

| 層                         | 場所                                                       | 対象                                     |
| -------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **基本トークン**           | `src/styles/globals.css` — `:root` / `.dark`               | アプリ全体（shadcn/ui コンポーネント）   |
| **公開ページ専用トークン** | `src/styles/globals.css` — `:root` / `.dark` (`--login-*`) | ログイン・サインアップ・招待・参加ページ |

TailwindCSS v4 の `@theme inline` ブロックですべてのトークンを CSS 変数にマッピングしており、
`bg-login-accent` のように Tailwind クラスとして直接使用できます。

---

## 2. カラートークン

すべてのカラー値は `oklch()` 形式で定義します。HEX / RGB の直接使用は SVG 専用 (`--login-accent-raw`) 以外禁止です。

### 2-1. 基本トークン（shadcn/ui 系）

`src/styles/globals.css` の `:root` に定義されています。
これらは shadcn/ui のコンポーネント（`Button`, `Input`, `Card` 等）が参照するトークンです。

```css
/* 主要トークンの抜粋 */
--background        /* ページ背景 */
--foreground        /* 本文テキスト */
--card              /* カード背景 */
--card-foreground   /* カード内テキスト */
--primary           /* プライマリアクション（shadcn デフォルト） */
--muted             /* 非強調背景 */
--muted-foreground  /* 非強調テキスト */
--border            /* 枠線 */
--radius            /* 角丸基準値: 0.625rem */
```

**ルール**: アプリ内ページ（認証後の `/` 以下）ではこれらのトークンを使用してください。

---

### 2-2. ログイン系トークン（公開ページ共通）

以下のトークンは **ログイン・サインアップ・招待リンク発行・アルバム参加** など、
認証前の公開ページすべてで共有される「思い出帳ブランドテーマ」です。

```
src/styles/globals.css
```

| CSS 変数               | Tailwind クラス例             | 用途                               |
| ---------------------- | ----------------------------- | ---------------------------------- |
| `--login-bg`           | `bg-login-bg`                 | ページ背景（和紙風オフホワイト）   |
| `--login-card`         | `bg-login-card`               | フォームカード背景                 |
| `--login-border`       | `border-login-border`         | カード・入力欄枠線                 |
| `--login-fg`           | `text-login-fg`               | メインテキスト（墨色）             |
| `--login-label`        | `text-login-label`            | フォームラベル                     |
| `--login-muted`        | `text-login-muted`            | 補足テキスト・フッター             |
| `--login-muted-bg`     | `bg-login-muted-bg`           | ホバー背景                         |
| `--login-input`        | `bg-login-input`              | 入力フィールド背景                 |
| `--login-placeholder`  | `text-login-placeholder`      | プレースホルダー                   |
| `--login-accent`       | `bg-login-accent`             | CTA ボタン・アクセント（桜ローズ） |
| `--login-accent-hover` | `hover:bg-login-accent-hover` | CTA ボタンホバー                   |
| `--login-accent-fg`    | `text-login-accent-fg`        | アクセント上のテキスト             |
| `--login-accent-raw`   | SVG `fill` 属性のみ           | 花びら SVG の直接カラー指定        |

#### ダークモード

すべての `--login-*` トークンは `.dark` セレクタでも上書き定義されており、
`prefers-color-scheme` で自動切り替えされます。新規トークンを追加する際は **必ず** `.dark` にも値を定義してください。

---

## 3. アクセントカラーシステム

認証後のアプリ内ページでは、ユーザーがアルバムごとに選択できる **アクセントカラー** を使用します。

### 定義場所

```
src/lib/data.ts       — AccentColor 型 / ACCENT_COLORS 配列
src/stores/themeStore.ts — useAccentStore（Zustand + sessionStorage）
```

### AccentColor 型

```typescript
export type AccentColor =
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'violet'
  | 'slate';
```

### AccentColorConfig 構造

```typescript
export interface AccentColorConfig {
  id: AccentColor;
  label: string; // 表示名（例: '青', '桜'）
  bg: string; // Tailwind クラス: 'bg-blue-600'
  bgHover: string; // 'hover:bg-blue-700'
  bgLight: string; // 'bg-blue-50'
  text: string; // 'text-blue-600'
  textHover: string; // 'hover:text-blue-700'
  border: string; // 'border-blue-600'
  ring: string; // 'ring-blue-600'
  dot: string; // 'bg-blue-600'
}
```

### 使用パターン

```typescript
// コンポーネント内での取得
import { useAccentStore } from '@/stores/themeStore';
import { ACCENT_COLORS } from '@/lib/data';

const { accent } = useAccentStore();
const accentConfig = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

// クラス適用
<button className={cn('text-white', accentConfig.bg, accentConfig.bgHover)}>
  保存
</button>
```

### 重要: 公開ページでのアクセントカラー不使用

招待・参加・ログインなど **認証前の公開ページ** では `useAccentStore` を使用しないでください。
これらのページはユーザーのアカウントと紐付かないため、`--login-accent` トークンを使用します。

---

## 4. タイポグラフィ

### フォント定義

```typescript
// src/app/layout.tsx
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google';
```

| 変数           | フォント      | Tailwind クラス | 用途                               |
| -------------- | ------------- | --------------- | ---------------------------------- |
| `--font-sans`  | Noto Sans JP  | `font-sans`     | 本文・ラベル・ボタン（デフォルト） |
| `--font-serif` | Noto Serif JP | `font-serif`    | アプリ名「思い出帳」・見出し装飾   |

### 使用ルール

- **アプリ名「思い出帳」** は必ず `font-serif` を使用する
- **本文・UI テキスト** はすべて `font-sans`
- フォントサイズは Tailwind のスケール（`text-xs`〜`text-2xl`）を使用し、任意値 (`text-[13px]`) は禁止
- 行間は `leading-relaxed` (1.625) または `leading-6` を本文に使用する
- 見出しと重要テキストは `text-balance` または `text-pretty` を付与してください

### 公開ページでの標準テキストスタイル

```tsx
// アプリ名
<h1 className="font-serif text-2xl font-medium tracking-widest text-login-fg">思い出帳</h1>

// キャッチコピー
<p className="text-xs font-sans text-login-muted tracking-wider">大切な記憶を、いつでも一緒に。</p>

// フォームラベル
<Label className="text-xs font-medium text-login-label tracking-wide font-sans">ラベル</Label>

// 補足テキスト
<p className="text-xs text-login-muted font-sans">補足テキスト</p>
```

---

## 5. ページ種別とテーマの使い分け

| ページ種別           | ルート例                                                    | 使用テーマ                      | 背景            |
| -------------------- | ----------------------------------------------------------- | ------------------------------- | --------------- |
| 認証前・公開ページ   | `/login`, `/signup`, `/join/[token]`, `/albums/[id]/invite` | `--login-*` トークン            | `bg-login-bg`   |
| 認証後・アプリページ | `/`, `/albums/[id]`                                         | 基本トークン + アクセントカラー | `bg-background` |

---

## 6. 公開ページのレイアウト構造

すべての公開ページは以下の構造に統一してください。

```tsx
<div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-login-bg">
  {/* 1. 背景装飾（最背面） */}
  <PetalDecoration />

  {/* 2. メインコンテンツ（z-10） */}
  <div className="relative z-10 w-full max-w-sm">
    {/* 2a. ブランドヘッダー */}
    <div className="flex flex-col items-center mb-10 gap-3">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-login-card border border-login-border shadow-sm">
        <AppIcon size={38} className="text-login-accent" />
      </div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-medium tracking-widest text-login-fg">
          思い出帳
        </h1>
        <p className="mt-1 text-xs font-sans text-login-muted tracking-wider">
          大切な記憶を、いつでも一緒に。
        </p>
      </div>
    </div>

    {/* 2b. カードコンテンツ */}
    <div className="bg-login-card border border-login-border rounded-2xl shadow-md px-7 py-8 flex flex-col gap-6">
      {/* ページ固有コンテンツ */}
    </div>

    {/* 2c. カード下の補足テキスト（任意） */}
    <p className="mt-6 text-center text-xs text-login-muted font-sans">...</p>
  </div>

  {/* 3. フッター（最前面・固定） */}
  <footer className="absolute bottom-6 text-center text-[11px] text-login-muted font-sans tracking-wider select-none z-10">
    &copy; 2026 思い出帳
  </footer>
</div>
```

### カード内 CTA ボタンの標準スタイル

```tsx
<button
  className={cn(
    'w-full h-11 text-sm font-medium font-sans tracking-wider rounded-lg',
    'bg-login-accent text-login-accent-fg hover:bg-login-accent-hover',
    'shadow-sm transition-all duration-200 hover:shadow active:scale-[0.98]'
  )}
>
  アクション名
</button>
```

### アウトラインボタン（Google ログイン等）の標準スタイル

```tsx
<button
  className={cn(
    'w-full h-11 text-sm font-medium gap-3 rounded-lg',
    'border border-login-border bg-login-card hover:bg-login-muted-bg',
    'text-login-fg shadow-xs transition-all duration-200',
    'hover:shadow-sm active:scale-[0.98]'
  )}
>
  ...
</button>
```

---

## 7. 共有コンポーネント

### AppIcon

```tsx
import { AppIcon } from '@/components/layout/app-icon';

// 使用方法
<AppIcon size={38} className="text-login-accent" />;
```

- `size`: px 単位の数値（デフォルト `24`）
- `className`: Tailwind の `text-*` クラスでカラーを制御（SVG は `currentColor` を使用）
- **公開ページ**: `text-login-accent`
- **アプリ内**: アクセントカラーの `text` クラス（例: `text-blue-600`）

### PetalDecoration（桜花びら背景）

`login-form.tsx` 内に定義されたインライン関数コンポーネントです。
公開ページに桜花びらの散布背景を追加します。

```tsx
// 同一ファイル内または別ファイルに切り出して使用
<PetalDecoration />
```

- `pointer-events-none` で操作に干渉しません
- `aria-hidden="true"` で装飾として扱われます
- `var(--login-accent-raw)` の HEX 値で花びらを描画します

### ACCENT_COLORS / useAccentStore

```typescript
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { useAccentStore } from '@/stores/themeStore';
```

アプリ内ページでのみ使用してください（詳細は [第3章](#3-アクセントカラーシステム)）。

---

## 8. 新規ページ追加チェックリスト

新しいページを作成する際は以下を確認してください。

### 公開ページ（認証前）

- [ ] ルートディレクトリは `src/app/` 直下またはグループなし（`(auth)` グループ等）
- [ ] 最外ラッパーに `bg-login-bg` を適用
- [ ] `PetalDecoration` コンポーネントを含める
- [ ] `AppIcon` + 「思い出帳」ブランドヘッダーを含める
- [ ] カードは `bg-login-card border border-login-border rounded-2xl shadow-md`
- [ ] CTA ボタンは `bg-login-accent` を使用
- [ ] テキストは `text-login-fg` / `text-login-label` / `text-login-muted` を使い分ける
- [ ] `useAccentStore` を使用しない
- [ ] フッターに `&copy; 2026 思い出帳` を配置
- [ ] `.dark` でも崩れないことを確認

### アプリ内ページ（認証後）

- [ ] ルートは `src/app/(app)/` グループ内
- [ ] `useAccentStore` でアクセントカラーを取得
- [ ] `ACCENT_COLORS.find(...)` で `AccentColorConfig` を取得してクラス適用
- [ ] `--login-*` トークンは使用しない
- [ ] shadcn/ui の `bg-background` / `text-foreground` / `bg-card` を基本とする

### 共通

- [ ] 直接 HEX/RGB カラーを Tailwind クラスに書かない
- [ ] `font-sans` / `font-serif` クラスを目的に応じて使い分ける
- [ ] モバイルファーストで `max-w-sm` を基本幅として使用
- [ ] `active:scale-[0.98]` でタップフィードバックを付与

---

## 9. 禁止事項

以下の実装パターンは品質・一貫性を損なうため禁止です。

| 禁止                                              | 理由                                      | 代替                                                            |
| ------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `text-white`, `bg-white`, `text-black` の直接使用 | トークンを経由しないと dark mode で崩れる | `text-login-accent-fg`, `bg-login-card`, `text-login-fg` を使用 |
| HEX / RGB 値の Tailwind クラス内直接記述          | テーマ変更時に一括変更できない            | `--login-*` 変数を `globals.css` に追加してマッピング           |
| `oklch()`以外の形式で CSS 変数を定義              | プロジェクト全体で形式を統一するため      | `oklch(L C H)` 形式を使用                                       |
| `useAccentStore` を公開ページで使用               | ユーザーセッションがなく意味をなさない    | `--login-accent` トークンを使用                                 |
| `--login-*` トークンをアプリ内ページで使用        | ブランドテーマとアプリテーマの混在        | 基本トークン + アクセントカラーを使用                           |
| `font-mono` を UI テキストに使用                  | 日本語フォントに対応していない            | `font-sans` / `font-serif` を使用                               |
| グラデーション (`gradient-*`) の多用              | ブランドの清潔感を損なう                  | ソリッドカラーのみ使用                                          |
| アニメーション `duration-` を 300ms 超に設定      | 操作の応答感が失われる                    | `duration-150` / `duration-200` を上限とする                    |
| 任意値クラス `text-[13px]`, `p-[16px]` 等         | スケールの一貫性が失われる                | Tailwind スケール値 (`text-xs`, `p-4`) を使用                   |
| `space-x-*` / `space-y-*` の使用                  | `gap-*` を優先する                        | `flex gap-4` / `grid gap-4` を使用                              |

---

## 付録: トークン追加手順

既存のトークンで対応できない新規デザインが必要な場合は以下の手順で追加してください。

1. `src/styles/globals.css` の `:root` に `--新しいトークン名: oklch(...)` を追加
2. `.dark {}` ブロックにダークモード値を追加（省略不可）
3. `@theme inline {}` ブロックに `--color-新しいトークン名: var(--新しいトークン名);` を追加
4. Tailwind クラス `bg-新しいトークン名` / `text-新しいトークン名` 等として使用可能になります
5. このドキュメントの [第2章](#2-カラートークン) に追加したトークンを記載してください

```css
/* 例: 成功状態のトークンを追加する場合 */
:root {
  --login-success: oklch(0.62 0.12 145); /* 緑系 */
  --login-success-fg: oklch(0.99 0.003 50);
}
.dark {
  --login-success: oklch(0.68 0.13 145);
  --login-success-fg: oklch(0.99 0.003 50);
}
@theme inline {
  --color-login-success: var(--login-success);
  --color-login-success-fg: var(--login-success-fg);
}
```
