'use client';

import { SettingsSubpageShell } from '@/components/settings/settings-subpage-shell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDevMemoStore, type DevMemo } from '@/stores/devMemoStore';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/** 開発用のローカルメモ一覧・編集画面。 */
export function DevMemoPage() {
  const memos = useDevMemoStore((s) => s.memos);
  const addMemo = useDevMemoStore((s) => s.addMemo);
  const [draft, setDraft] = useState('');

  const sorted = useMemo(
    () => [...memos].sort((a, b) => b.updatedAt - a.updatedAt),
    [memos]
  );

  return (
    <SettingsSubpageShell title="開発用メモ">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="メモを入力…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-20"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-end"
            onClick={() => {
              addMemo(draft);
              setDraft('');
            }}
          >
            追加
          </Button>
        </div>

        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {sorted.map((memo) => (
            <li key={memo.id}>
              <MemoRow memo={memo} />
            </li>
          ))}
        </ul>
      </div>
    </SettingsSubpageShell>
  );
}

function MemoRow({ memo }: { memo: DevMemo }) {
  const updateMemo = useDevMemoStore((s) => s.updateMemo);
  const removeMemo = useDevMemoStore((s) => s.removeMemo);
  const [text, setText] = useState(memo.text);

  useEffect(() => {
    setText(memo.text);
  }, [memo.id, memo.text]);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <p className="font-sans text-[11px] text-muted-foreground">
        {new Date(memo.updatedAt).toLocaleString('ja-JP')}
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-16"
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => removeMemo(memo.id)}
          aria-label="メモを削除"
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => updateMemo(memo.id, text)}
        >
          更新
        </Button>
      </div>
    </div>
  );
}
