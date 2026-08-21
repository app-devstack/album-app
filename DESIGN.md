# DESIGN.md

## このファイルの役割

Album App の **UI デザイン方針**をまとめた生きた文書です。`AGENTS.md` / `CLAUDE.md` と同じくリポジトリ直下に置き、AI エージェントと実装者が UI を追加・修正するときに従う基準とします。

- コードより **意図とルール**を優先して書く（具体的なクラス名や Tailwind 値は、方針を実装に落とすための指針）
- 章立てで追記する。新しい UI 領域（フォーム、一覧、ナビゲーションなど）は、下記「目次」に節を足していく
- 実装前に該当節を読み、既存コンポーネントの **参照実装**に合わせる

### 目次

1. [ダイアログ操作](#1-ダイアログ操作) — フッターボタン・確認ダイアログ・関連メニュー・却下の文言
2. （今後追記）フォーム・入力
3. （今後追記）一覧・グリッド
4. （今後追記）ナビゲーション・ヘッダー

---

## 1. ダイアログ操作

ダイアログおよび AlertDialog の **フッター操作**、および「次のダイアログを開く／破壊的操作」系の **DropdownMenu 項目**を対象とする。

本アプリはスマホ WebView を主とするため、**左＝却下・右＝確定**の意味づけは Google Material / Apple HIG に揃える。**Windows の「OK 左・キャンセル右」は採用しない**。

配置については、ダイアログ本文が中央寄りのとき、フッターを右に寄せるとバランスが崩れる。そのため **Material の「操作群を右にまとめる」配置は採用しない**。二択は **左右端に離して置く**（従来形）。

| プラットフォーム | 左 / 右の意味 | 本アプリの配置 |
|---|---|---|
| Material（Google） | 左 = 却下、右 = 確定 | 意味は採用。右寄せ隣接は **不採用** |
| Apple HIG | 左 = Cancel、右 = Default | 意味は採用 |
| Windows | 左 = OK、右 = Cancel | **不採用** |

### 1.1 並び

#### 2 操作（基本）

```
[ キャンセル / 戻る / 閉じる ]          [ 保存 / 作成 / 削除 / 再送 ]
         却下（左端）                              意思決定（右端）
```

- **左 = 却下**（キャンセル、戻る、閉じる）。**「やめる」は使わない**（[1.9](#19-却下の文言)）
- **右 = 意思決定**（保存、作成、削除、再送、取り消す など）
- 配置は **`flex-row justify-between gap-2`（以上）**。左端に却下、右端に確定。`justify-end` で右に寄せない
- `gap-2` は `justify-between` の保険。狭い幅でもボタン同士がくっつかない
- **DOM 順 = 視覚順**：先に却下、後に意思決定

#### 3 操作（送信待ちなど）

左から **閉じる → 取り消す → もう一度送る**。横 1 行のまま（`justify-between` で横に分かれる）。

```
[ 閉じる ]  [ 取り消す ]  [ もう一度送る ]
  却下         破壊           確定（右端）
```

#### 縦積みは今回やらない

- **2 択は常に横並び**。`flex-col-reverse` は使わない
- 縦積み（ラベルが長いとき・3 択など）は将来の特殊ケースで検討するだけ。今回のダイアログでは行わない

### 1.2 視覚（variant）

| 役割 | variant | 位置 |
|---|---|---|
| 却下（キャンセル / 戻る / 閉じる） | `ghost` | 左 |
| 意思決定（保存 / 作成 / 再送） | 塗り（アクセント色または `default`） | 右 |
| 破壊的操作（削除 / 取り消す） | `destructive` | 右（2 操作なら右端、3 操作なら中〜右） |

- キャンセルに `outline` は使わない（`ghost` に統一）
- 破壊的操作を **DropdownMenu** に置く場合、項目の **直前に `DropdownMenuSeparator`** を入れる

**視覚の基準実装**: `src/components/album-detail/album-detail-settings-dialog.tsx` — ゴースト「キャンセル」＋塗り「保存」。

### 1.3 寸法・間隔

間隔は **親要素の `gap` で管理**する。子ボタンに `mt` / `mb` を付けない。

| 対象 | 値 |
|---|---|
| ダイアログ操作ボタン | 現行 default（`h-9` / `px-4` / `py-2`）に **padding 縦横 +2px** → おおよそ `h-10 px-[18px] py-2.5` |
| 操作同士 | **`gap-2` 以上**（`justify-between` の保険。狭い幅でもくっつかない） |
| `DialogContent` 内のセクション間 | `gap-4`（維持） |
| メニュー（破壊的操作・次ダイアログを開く行） | 項目に `py-3 text-base` |

- `h-11` や `size="lg"`（`px-6`）へ跳ね上げない
- `Button` に dialog 専用の oversized variant（例: `touch`）は追加しない

### 1.4 スクロール本体があるダイアログ

本文がスクロールするダイアログでは、操作ボタンを **スクロール領域の外**に置く。

- `DialogFooter` を使い、`DialogContent` 内でスクロール本体（`ScrollArea` や `overflow-y-auto`）とフッターを分離する
- フッターは常に見える位置に固定する

**参照実装**: `album-detail-settings-dialog.tsx` — カバー一覧はスクロール内、キャンセル／保存は `DialogFooter`（スクロール外）。

### 1.5 対象外

次は本節のルール **適用外**（既存のまま維持）。

| 対象 | 理由 |
|---|---|
| メモフォームの操作（`h-7`） | インライン編集 UI |
| ヘッダーのユーザー／テーマメニュー | ナビゲーション系 |
| Native `UploadChoiceSheet` | Expo ネイティブ UI |
| メディア追加ダイアログの大きな選択枠 | タップ領域が主目的の選択 UI |
| `DropdownMenuItem` のデフォルト `py-1.5` | グローバル変更しない。対象メニューのみ `py-3 text-base` を指定 |

### 1.6 Do / Don't

#### Do

- 2 操作は **左キャンセル・右確定**、配置は **`justify-between` + `gap-2` 以上**（左右端に離す）
- キャンセルは `variant="ghost"`
- 破壊的操作は `variant="destructive"` を **右** に置く
- DOM 順を **キャンセル → 確定** にする
- スクロールダイアログは `DialogFooter` で操作を固定
- 破壊的メニュー項目の前に `DropdownMenuSeparator`
- 参照実装（設定ダイアログ）の見た目に合わせる

#### Don't

- 削除・取り消しなど破壊的確認の却下に「やめる」を使う（否定の否定になり、確認を中断するのか確定するのか分からない）
- `justify-end` で操作を右に寄せる（本文が中央寄りのときバランスが崩れる）
- `flex-col-reverse` や縦積みで確定を上に置く（今回のダイアログではやらない）
- キャンセルに `outline` を使う
- 子ボタンに `mt` / `mb` で間隔を取る
- `DropdownMenuItem` のデフォルト padding をグローバル変更
- ダイアログ操作を `h-11` 以上にする

### 1.7 参照コンポーネント

| ファイル | 役割 |
|---|---|
| `src/components/album-detail/album-detail-settings-dialog.tsx` | **視覚の基準**（ghost キャンセル + 塗り保存）。フッターはスクロール外 |
| `src/components/album-detail/album-detail-delete-dialog.tsx` | 削除確認（2 操作・destructive 右） |
| `src/components/album/create-album-dialog.tsx` | アルバム作成（左右端配置） |
| `src/components/pages/GroupSettingsPage.tsx` | グループ名編集（キャンセル `ghost`） |
| `src/components/album-detail/album-detail-pending-upload-retry-dialog.tsx` | 送信待ち Dialog（3 操作・横並び） |
| `src/components/album-detail/album-detail.tsx` | アルバム編集／削除メニュー |
| `src/components/album-detail/album-detail-lightbox-dialog.tsx` | メニュー `py-3 text-base` の参照 |
| `src/components/ui/dialog.tsx` | `DialogFooter` プリミティブ |
| `src/components/ui/alert-dialog.tsx` | `AlertDialogFooter` プリミティブ |

### 1.8 実装時の共通パターン

**DialogFooter（2 操作）**

```tsx
<DialogFooter>
  <Button variant="ghost" onClick={onCancel}>キャンセル</Button>
  <Button onClick={onConfirm}>保存</Button>
</DialogFooter>
```

**DialogFooter（3 操作・送信待ち）**

```tsx
<DialogFooter>
  <Button variant="ghost">閉じる</Button>
  <Button variant="destructive" onClick={onCancelUpload}>取り消す</Button>
  <Button onClick={onRetry}>もう一度送る</Button>
</DialogFooter>
```

**破壊的メニュー項目**

```tsx
<DropdownMenuItem className="cursor-pointer py-3 text-base" onSelect={onEdit}>
  アルバムを編集
</DropdownMenuItem>
<DropdownMenuSeparator />
<DropdownMenuItem variant="destructive" className="cursor-pointer py-3 text-base" onSelect={onDelete}>
  アルバムを削除
</DropdownMenuItem>
```

プリミティブ側の目標: `DialogFooter` / `AlertDialogFooter` は `flex flex-row justify-between gap-2`（`flex-col-reverse` なし・`justify-end` なし）。

### 1.9 却下の文言

削除・取り消し・delete 系の確認では、左の却下に **「やめる」を使わない**。

「アルバムへの追加を取り消しますか？」に対する「やめる」は、**取り消し自体をやめる**のか、**確認を閉じて何もしない**のかが日本語として二重否定になり、利用者が混乱する。削除確認でも同様（「削除をやめる」＝残す、なのか不明）。

- **却下（左）**: 「キャンセル」「閉じる」など、**今の確認を中断して何もしない**と分かる語
- **意思決定（右）**: 「削除」「取り消す」など、確認タイトルの操作そのもの
- **「キャンセル」と「取り消す」は並べない**: 操作の意味が取り消しでも、最終確認の確定は **「削除」** にする（例: 送信待ち）。却下の「キャンセル」と同義になり、否定の否定になるため

保存・作成など非破壊の確認でも、却下は「キャンセル」「閉じる」を優先する。「やめる」は新規に置かない。
