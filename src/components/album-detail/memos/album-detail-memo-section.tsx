'use client';

import { AlbumDetailStickyActions } from '@/components/album-detail/album-detail-sticky-actions';
import { Button } from '@/components/ui/button';
import { useAlbumMemoContext } from '@/contexts/album-memo-context';
import { type AccentColorConfig } from '@/lib/data';
import { cn } from '@/lib/utils';
import { NotebookPenIcon, PlusIcon } from 'lucide-react';
import { RefObject, useCallback, useRef } from 'react';
import { AlbumDetailMemoCard } from './album-detail-memo-card';
import { AlbumDetailMemoForm } from './album-detail-memo-form';

/** アルバム詳細画面のメモセクションに渡すプロパティ。 */
export interface AlbumDetailMemoSectionProps {
  accentConfig: AccentColorConfig; // アルバムのテーマカラー設定
  onAddPhoto: () => void; // 写真追加ボタン押下時のハンドラ
}

/** アルバム詳細画面のメモ一覧と、追加アクションボタンを管理するセクション。 */
export function AlbumDetailMemoSection({
  accentConfig,
  onAddPhoto,
}: AlbumDetailMemoSectionProps) {
  const { isLoadingMemos, openComposer, isComposerOpen, editingMemoId } = useAlbumMemoContext();
  const memoFormAnchorRef = useRef<HTMLDivElement>(null);
  
  const isFormActive = isComposerOpen || editingMemoId !== null;

  const scrollToMemoForm = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        memoFormAnchorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  }, []);

  const handleStickyAddMemo = useCallback(() => {
    openComposer();
    scrollToMemoForm();
  }, [openComposer, scrollToMemoForm]);

  return (
    <>
      {isLoadingMemos ? (
        <div>Loading memos...</div>
      ) : (
        <AlbumMemos
          accentConfig={accentConfig}
          scrollAnchorRef={memoFormAnchorRef}
        />
      )}

      <AlbumDetailStickyActions
        accentConfig={accentConfig}
        onAddPhoto={onAddPhoto}
        onAddMemo={handleStickyAddMemo}
        isHidden={isFormActive}
      />
    </>
  );
}

/** アルバム詳細画面のメモ一覧を表示するコンポーネントに渡すプロパティ。 */
interface AlbumMemosProps {
  accentConfig: AccentColorConfig; // アルバムのテーマカラー設定
  scrollAnchorRef?: RefObject<HTMLDivElement | null>; // フォームへのスクロール用アンカー
}

/** アルバム詳細画面のメモ一覧を表示するコンポーネント。 */
function AlbumMemos({ accentConfig, scrollAnchorRef }: AlbumMemosProps) {
  const {
    memos,
    isComposerOpen,
    openComposer,
    closeComposer,
    addMemo,
    editMemo,
    removeMemo,
    editingMemoId,
  } = useAlbumMemoContext();
  const isFormActive = isComposerOpen || editingMemoId !== null;

  return (
    <section aria-label="旅のメモ">
      <div className="flex items-center justify-between mb-4">
        {/* タイトル */}
        <div className="flex items-center gap-2">
          <NotebookPenIcon size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground tracking-wide">
            旅のメモ
          </h2>
          {memos.length > 0 && (
            <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full tabular-nums">
              {memos.length}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn('h-7 text-xs gap-1.5', accentConfig.text)}
          onClick={openComposer}
          disabled={isFormActive}
          aria-label="メモを追加する"
        >
          <PlusIcon size={12} />
          メモを追加
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {/* スクロール用 */}
        <div ref={scrollAnchorRef} aria-hidden />

        {/* メモ入力フォーム */}
        {isComposerOpen && (
          <AlbumDetailMemoForm
            accentConfig={accentConfig}
            addMemo={addMemo}
            onClose={closeComposer}
          />
        )}

        {memos.length === 0 && !isComposerOpen ? (
          <button
            onClick={openComposer}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
            aria-label="最初のメモを追加する"
          >
            <NotebookPenIcon size={22} />
            <span className="text-xs leading-relaxed text-center">
              写真では伝えきれない
              <br />
              記憶や感想を書き残しましょう
            </span>
          </button>
        ) : (
          memos.map((memo) => (
            <AlbumDetailMemoCard
              key={memo.id}
              memo={memo}
              accentConfig={accentConfig}
              onUpdate={editMemo}
              onDelete={removeMemo}
            />
          ))
        )}
      </div>
    </section>
  );
}
