'use client';

import { AppTitle } from '@/components/layout/app-title';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GroupJoinExpired() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-login-bg">
      <PetalDecoration />

      <div className="relative z-10 w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <AppTitle />

        {/* カード */}
        <div className="bg-login-card border border-login-border rounded-2xl shadow-md overflow-hidden">
          {/* イラストバンド */}
          <div className="h-36 bg-login-bg border-b border-login-border flex flex-col items-center justify-center gap-2">
            <div className="h-14 w-14 rounded-full bg-login-card border border-login-border shadow-sm flex items-center justify-center">
              <Clock
                size={26}
                strokeWidth={1.75}
                className="text-login-accent"
              />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium font-sans bg-login-accent/10 text-login-accent border border-login-accent/20">
              <Clock size={11} strokeWidth={2} />
              有効期限切れ
            </span>
          </div>

          {/* ボディ */}
          <div className="px-6 pt-6 pb-7 flex flex-col items-center gap-5 text-center">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-login-fg font-sans text-balance">
                招待リンクの有効期限が切れています
              </h2>
              <p className="text-sm text-login-muted font-sans leading-relaxed text-pretty">
                この招待リンクは有効期限が過ぎているため、使用できません。
                グループのオーナーに新しい招待リンクを発行してもらってください。
              </p>
            </div>

            <div className="h-px w-full bg-login-border" />

            {/* 次のステップ */}
            <div className="w-full bg-login-bg rounded-xl border border-login-border px-4 py-4 text-left space-y-3">
              <p className="text-xs font-semibold text-login-label font-sans">
                次のステップ
              </p>
              <ul className="space-y-2">
                {[
                  'グループのオーナーに連絡する',
                  '新しい招待リンクを送ってもらう',
                  '新しいリンクから再度参加する',
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-login-muted font-sans"
                  >
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-login-accent text-login-accent-fg flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full h-11 gap-2 text-sm font-medium font-sans border-login-border text-login-fg hover:bg-login-muted-bg rounded-lg transition-all active:scale-[0.98]"
            >
              <RefreshCcw size={13} />
              トップページに戻る
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-login-muted mt-5 leading-relaxed font-sans px-4">
          お困りの場合はグループのオーナーにお問い合わせください。
        </p>
      </div>

      <footer className="absolute bottom-6 text-center text-[11px] text-login-muted font-sans tracking-wider select-none z-10">
        &copy; 2026 思い出帳
      </footer>
    </div>
  );
}

function PetalDecoration() {
  const petals = [
    { top: '7%', left: '6%', size: 16, rotate: 20, opacity: 0.16 },
    { top: '13%', left: '89%', size: 12, rotate: -15, opacity: 0.13 },
    { top: '30%', left: '2%', size: 9, rotate: 45, opacity: 0.11 },
    { top: '54%', left: '92%', size: 15, rotate: 10, opacity: 0.14 },
    { top: '73%', left: '4%', size: 11, rotate: -30, opacity: 0.12 },
    { top: '91%', left: '41%', size: 13, rotate: -10, opacity: 0.09 },
    { top: '3%', left: '53%', size: 7, rotate: 35, opacity: 0.08 },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((p, i) => (
        <svg
          key={i}
          width={p.size}
          height={p.size}
          viewBox="0 0 20 20"
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            transform: `rotate(${p.rotate}deg)`,
            opacity: p.opacity,
          }}
        >
          {[0, 72, 144, 216, 288].map((deg, j) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const cx = 10 + Math.cos(rad) * 4.2;
            const cy = 10 + Math.sin(rad) * 4.2;
            return (
              <ellipse
                key={j}
                cx={cx}
                cy={cy}
                rx="3.2"
                ry="2.0"
                transform={`rotate(${deg}, ${cx}, ${cy})`}
                fill="var(--login-accent-raw)"
              />
            );
          })}
          <circle cx="10" cy="10" r="1.8" fill="var(--login-accent-raw)" />
        </svg>
      ))}
    </div>
  );
}
