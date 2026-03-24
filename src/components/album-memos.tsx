'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Memo, type AccentColorConfig } from '@/lib/data';
import { cn } from '@/lib/utils';

// ムードタグの選択肢
const MOOD_OPTIONS = [
  { label: '感動', color: 'bg-rose-100 text-rose-700' },
  { label: '幸福', color: 'bg-amber-100 text-amber-700' },
  { label: '静寂', color: 'bg-sky-100 text-sky-700' },
  { label: '発見', color: 'bg-emerald-100 text-emerald-700' },
  { label: '懐かしい', color: 'bg-violet-100 text-violet-700' },
  { label: '感謝', color: 'bg-pink-100 text-pink-700' },
];

function getMoodStyle(label: string | undefined) {
  return (
    MOOD_OPTIONS.find((m) => m.label === label)?.color ??
    'bg-muted text-muted-foreground'
  );
}

function formatMemoDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// ---- MemoCard ----

interface MemoCardProps {
  memo: Memo;
  accentConfig: AccentColorConfig;
  onUpdate: (updated: Memo) => void;
  onDelete: (id: string) => void;
}

function MemoCard({ memo, accentConfig, onUpdate, onDelete }: MemoCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftBody, setDraftBody] = useState(memo.body);
  const [draftMood, setDraftMood] = useState<string | undefined>(memo.mood);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      // カーソルを末尾へ
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const handleSave = () => {
    if (!draftBody.trim()) return;
    onUpdate({
      ...memo,
      body: draftBody.trim(),
      mood: draftMood,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraftBody(memo.body);
    setDraftMood(memo.mood);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4 transition-shadow',
        editing ? 'shadow-md' : 'hover:shadow-sm'
      )}
    >
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* ムードタグ */}
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

        {/* 操作ボタン（非編集時はホバーで表示） */}
        {!editing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="メモを編集"
            >
              <Pencil size={12} />
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={() => onDelete(memo.id)}
                  className="h-6 px-2 rounded-full text-[11px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  aria-label="削除を確定"
                >
                  削除
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

      {/* 本文 */}
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

      {/* フッター */}
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
            ? `${formatMemoDate(memo.updatedAt)} 更新`
            : formatMemoDate(memo.createdAt)}
        </p>
      )}
    </div>
  );
}

// ---- NewMemoForm ----

interface NewMemoFormProps {
  accentConfig: AccentColorConfig;
  onAdd: (memo: Memo) => void;
  onClose: () => void;
}

function NewMemoForm({ accentConfig, onAdd, onClose }: NewMemoFormProps) {
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!body.trim()) return;
    const now = new Date().toISOString().split('T')[0];
    onAdd({
      id: `memo-${Date.now()}`,
      body: body.trim(),
      mood,
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card px-5 py-4 flex flex-col gap-3">
      {/* ムード選択 */}
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

      {/* テキスト入力 */}
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

// ---- AlbumMemos (main export) ----

interface AlbumMemosProps {
  memos: Memo[];
  accentConfig: AccentColorConfig;
  onChange: (updated: Memo[]) => void;
}

export function AlbumMemos({ memos, accentConfig, onChange }: AlbumMemosProps) {
  const [adding, setAdding] = useState(false);

  const handleAdd = (memo: Memo) => {
    onChange([memo, ...memos]);
    setAdding(false);
  };

  const handleUpdate = (updated: Memo) => {
    onChange(memos.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDelete = (id: string) => {
    onChange(memos.filter((m) => m.id !== id));
  };

  return (
    <section aria-label="旅のメモ">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <NotebookPen size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground tracking-wide">
            旅のメモ
          </h2>
          {memos.length > 0 && (
            <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full tabular-nums">
              {memos.length}
            </span>
          )}
        </div>
        {!adding && (
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 text-xs gap-1.5', accentConfig.text)}
            onClick={() => setAdding(true)}
            aria-label="メモを追加する"
          >
            <Plus size={12} />
            メモを追加
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* 新規入力フォーム */}
        {adding && (
          <NewMemoForm
            accentConfig={accentConfig}
            onAdd={handleAdd}
            onClose={() => setAdding(false)}
          />
        )}

        {/* 既存メモ一覧 */}
        {memos.length === 0 && !adding ? (
          <button
            onClick={() => setAdding(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
            aria-label="最初のメモを追加する"
          >
            <NotebookPen size={22} />
            <span className="text-xs leading-relaxed text-center">
              写真では伝えきれない
              <br />
              記憶や感想を書き残しましょう
            </span>
          </button>
        ) : (
          memos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              accentConfig={accentConfig}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
