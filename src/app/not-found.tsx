'use client';

import { AppIcon } from '@/components/layout/app-icon';
import { ACCENT_COLORS } from '@/lib/data';
import { useAccentStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NotFound() {
  const accent = useAccentStore((state) => state.accent);
  const currentAccent = ACCENT_COLORS.find((a) => a.id === accent)!;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--login-bg)' }}
    >
      {/* 花びら装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[
          { top: '8%',  left: '12%', size: 18, rotate: -20, opacity: 0.18 },
          { top: '14%', left: '78%', size: 14, rotate: 35,  opacity: 0.14 },
          { top: '72%', left: '6%',  size: 16, rotate: 15,  opacity: 0.16 },
          { top: '80%', left: '85%', size: 12, rotate: -45, opacity: 0.13 },
          { top: '45%', left: '92%', size: 10, rotate: 60,  opacity: 0.12 },
          { top: '55%', left: '3%',  size: 11, rotate: -30, opacity: 0.12 },
        ].map((p, i) => (
          <AppIcon
            key={i}
            size={p.size}
            className={currentAccent.text}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              transform: `rotate(${p.rotate}deg)`,
              opacity: p.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* カード */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 rounded-2xl border px-10 py-12 shadow-sm text-center max-w-sm w-full"
        style={{
          background: 'var(--login-card)',
          borderColor: 'var(--login-border)',
        }}
      >
        {/* アイコン */}
        <div
          className={cn(
            'flex items-center justify-center w-16 h-16 rounded-full',
            currentAccent.bgLight
          )}
        >
          <AppIcon size={36} className={currentAccent.text} />
        </div>

        {/* 404 数字 */}
        <div className="flex flex-col items-center gap-1">
          <p
            className={cn('font-sans font-bold leading-none', currentAccent.text)}
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
            currentAccent.bgHover,
          )}
          style={{ color: 'var(--login-accent-fg)' }}
        >
          トップへ戻る
        </Link>

        {/* ブランド */}
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--login-muted)' }}
        >
          <AppIcon size={14} className={currentAccent.text} />
          <span className="tracking-wider">思い出帳</span>
        </div>
      </div>
    </div>
  );
}
