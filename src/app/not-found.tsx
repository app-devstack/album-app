'use client';

import { ACCENT_COLORS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';
import Link from 'next/link';

export default function NotFound() {
  const accent = useAccentStore((state) => state.accent);
  const currentAccent = ACCENT_COLORS.find((a) => a.id === accent)!;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--login-bg)' }}
    >
      {/* カード */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 rounded-2xl border px-10 py-12 shadow-sm text-center max-w-sm w-full"
        style={{
          background: 'var(--login-card)',
          borderColor: 'var(--login-border)',
        }}
      >
        {/* 404 数字 */}
        <div className="flex flex-col items-center gap-1">
          <p
            className={cn(
              'font-sans font-bold leading-none',
              currentAccent.text
            )}
            style={{ fontSize: '4.5rem', letterSpacing: '-0.04em' }}
          >
            404
          </p>
          <p
            className="font-sans text-sm tracking-widest uppercase"
            style={{ color: 'var(--login-muted)' }}
          >
            Page Not Found
          </p>
        </div>

        {/* メッセージ */}
        <div className="flex flex-col gap-1.5">
          <p
            className="font-sans text-base font-medium leading-relaxed"
            style={{ color: 'var(--login-fg)' }}
          >
            お探しのページが見つかりません
          </p>
          <p
            className="font-sans text-sm leading-relaxed"
            style={{ color: 'var(--login-muted)' }}
          >
            ページが移動・削除されたか、URLが正しくない可能性があります。
          </p>
        </div>

        {/* ホームへ戻るボタン */}
        <Link
          href="/"
          className={cn(
            'inline-flex items-center justify-center gap-2 w-full rounded-lg px-5 py-2.5',
            'font-sans text-sm font-medium transition-colors duration-150',
            currentAccent.bg,
            currentAccent.bgHover
          )}
          style={{ color: 'var(--login-accent-fg)' }}
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
