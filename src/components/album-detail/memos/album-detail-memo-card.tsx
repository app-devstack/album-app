'use client';

import { Button } from '@/components/ui/button';
import { useAlbumMemoContext } from '@/contexts/album-memo-context';
import { type Memo } from '@/db/schema';
import { type AccentColorConfig } from '@/lib/data';
import { formatJapaneseDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MOOD_OPTIONS } from './album-detail-memo-constants';
import { getMoodStyle } from './album-detail-memo-utils';

/** アルバム詳細画面の各メモを表示・編集するカードコンポーネントに渡すプロパティ。 */
export interface AlbumDetailMemoCardProps {
  memo: Memo;
  accentConfig: AccentColorConfig;
  onUpdate: (updated: Partial<Memo> & { id: string }) => Promise<Memo>;
  onDelete: (id: string) => Promise<{ message: string }>;
}

/** アルバム詳細画面の各メモを表示・編集するカードコンポーネント。 */
export function AlbumDetailMemoCard({
  memo,
  accentConfig,
  onUpdate,
  onDelete,
}: AlbumDetailMemoCardProps) {
  const { editingMemoId, setEditingMemoId, isComposerOpen } = useAlbumMemoContext();
  const editing = editingMemoId === memo.id;
  const isFormActive = isComposerOpen || editingMemoId !== null;
  const [draftBody, setDraftBody] = useState(memo.body);
  const [draftMood, setDraftMood] = useState<string | undefined>(
    memo.mood ?? undefined
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const handleSave = async () => {
    if (!draftBody.trim()) return;
    await onUpdate({
      id: memo.id,
      body: draftBody.trim(),
      mood: draftMood,
    });
    setEditingMemoId(null);
  };

  const handleCancel = () => {
    setDraftBody(memo.body);
    setDraftMood(memo.mood ?? undefined);
    setEditingMemoId(null);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4 transition-shadow',
        editing ? 'shadow-md' : 'hover:shadow-sm'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {editing ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.label}
                  onClick={() =>
                    setDraftMood(draftMood === m.label ? undefined : m.label)
                  }
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all',
                    draftMood === m.label
                      ? cn(m.color, 'border-current ring-1 ring-current/30')
                      : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          ) : (
            memo.mood && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-medium',
                  getMoodStyle(memo.mood)
                )}
              >
                {memo.mood}
              </span>
            )
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-0.5 transition-opacity shrink-0">
            <button
              onClick={() => setEditingMemoId(memo.id)}
              disabled={isFormActive}
              className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              aria-label="メモを編集"
            >
              <Pencil size={12} />
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    await onDelete(memo.id);
                    setIsDeleting(false);
                  }}
                  className="h-6 px-2 rounded-full text-[11px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  aria-label="削除を確定"
                  disabled={isDeleting}
                >
                  {isDeleting ? '削除中...' : '削除'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="キャンセル"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors"
                aria-label="メモを削除"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="思い出や感想を書きましょう…"
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
          }}
        />
      ) : (
        <p className="text-sm text-foreground leading-[1.85] whitespace-pre-wrap">
          {memo.body}
        </p>
      )}

      {editing ? (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            ⌘ + Enter で保存
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={handleCancel}
            >
              キャンセル
            </Button>
            <Button
              size="sm"
              className={cn(
                'h-7 text-xs text-white gap-1',
                accentConfig.bg,
                accentConfig.bgHover
              )}
              onClick={handleSave}
              disabled={!draftBody.trim()}
            >
              <Check size={11} />
              保存する
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground/60">
          {memo.updatedAt !== memo.createdAt
            ? `${formatJapaneseDate(memo.updatedAt)} 更新`
            : formatJapaneseDate(memo.createdAt)}
        </p>
      )}
    </div>
  );
}
