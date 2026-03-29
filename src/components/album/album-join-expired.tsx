'use client';

import { useRouter } from 'next/navigation';
import { Clock, ImageIcon, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';

interface AlbumJoinExpiredProps {
  accent: AccentColor;
}

export function AlbumJoinExpired({ accent }: AlbumJoinExpiredProps) {
  const router = useRouter();
  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-0">

        {/* App wordmark */}
        <div className="flex justify-center mb-8">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-semibold tracking-widest uppercase',
              accentConfig.text
            )}
          >
            <ImageIcon size={15} strokeWidth={2} />
            思い出帳
          </span>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl border border-border bg-card shadow-sm overflow-hidden">

          {/* Illustration band */}
          <div
            className={cn(
              'h-36 flex flex-col items-center justify-center gap-2',
              accentConfig.bgLight
            )}
          >
            <div
              className={cn(
                'h-14 w-14 rounded-full flex items-center justify-center bg-background shadow-sm'
              )}
            >
              <Clock size={26} strokeWidth={1.75} className={accentConfig.text} />
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 pb-7 flex flex-col items-center gap-5 text-center">

            <div className="space-y-2">
              <h1 className="text-base font-semibold text-foreground text-balance">
                招待リンクの有効期限が切れています
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                この招待リンクは有効期限が過ぎているため、使用できません。
                グループのオーナーに新しい招待リンクを発行してもらってください。
              </p>
            </div>

            {/* Expiry detail chip */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                accentConfig.bgLight,
                accentConfig.text
              )}
            >
              <Clock size={12} strokeWidth={2} />
              有効期限切れ
            </div>

            {/* What to do */}
            <div className="w-full rounded-2xl bg-muted/50 px-4 py-4 text-left space-y-2.5">
              <p className="text-xs font-medium text-foreground">次のステップ</p>
              <ul className="space-y-1.5">
                {[
                  'グループのオーナーに連絡する',
                  '新しい招待リンクを送ってもらう',
                  '新しいリンクから再度参加する',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold text-white',
                        accentConfig.bg
                      )}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="w-full gap-2 text-sm font-medium"
            >
              <RefreshCcw size={13} />
              トップページに戻る
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed px-4">
          お困りの場合はグループのオーナーにお問い合わせください。
        </p>
      </div>
    </main>
  );
}
