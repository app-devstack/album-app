'use client';

import { Button } from '@/components/ui/button';
import { type Memo } from '@/db/schema';
import { type AccentColorConfig } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MOOD_OPTIONS } from './album-detail-memo-constants';

/** アルバム詳細画面の新規メモ作成フォームに渡すプロパティ。 */
export interface AlbumDetailMemoFormProps {
  accentConfig: AccentColorConfig;
  addMemo: (memo: { body: string; mood?: string }) => Promise<Memo>;
  onClose: () => void;
}

/** アルバム詳細画面の新規メモ作成フォームコンポーネント。 */
export function AlbumDetailMemoForm({
  accentConfig,
  addMemo,
  onClose,
}: AlbumDetailMemoFormProps) {
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    await addMemo({
      body: body.trim(),
      mood,
    });
    onClose();
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-muted-foreground mr-1">気分：</span>
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.label}
            onClick={() => setMood(mood === m.label ? undefined : m.label)}
            className={cn(
              'px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all',
              mood === m.label
                ? cn(m.color, 'border-current ring-1 ring-current/30')
                : 'bg-muted text-muted-foreground border-transparent hover:border-border'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="旅の記憶、感じたこと、忘れたくない瞬間を書きましょう…"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          ⌘ + Enter で保存
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={onClose}
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
            onClick={handleSubmit}
            disabled={!body.trim()}
          >
            <Check size={11} />
            追加する
          </Button>
        </div>
      </div>
    </div>
  );
}
