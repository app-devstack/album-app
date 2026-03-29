'use client';

import { Button } from '@/components/ui/button';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Copy, Home, ImageIcon, Link2Off } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AlbumJoinNotFoundProps {
  accent: AccentColor;
  /** The invalid token / URL fragment that was used, shown to help the user spot typos */
  token?: string;
}

export function AlbumJoinNotFound({ accent, token }: AlbumJoinNotFoundProps) {
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
          <div className="h-36 bg-muted/40 flex flex-col items-center justify-center gap-2">
            <div className="h-14 w-14 rounded-full flex items-center justify-center bg-background shadow-sm border border-border">
              <Link2Off size={26} strokeWidth={1.75} className="text-muted-foreground" />
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 pb-7 flex flex-col items-center gap-5 text-center">

            <div className="space-y-2">
              <h1 className="text-base font-semibold text-foreground text-balance">
                招待グループが見つかりません
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                URLが正しくないか、すでに削除されたグループの可能性があります。
                送られたリンクをもう一度確認してみてください。
              </p>
            </div>

            {/* Token display — helps user spot copy-paste errors */}
            {token && (
              <div className="w-full rounded-2xl border border-border bg-muted/40 px-4 py-3 text-left space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  入力されたURL末尾のコード
                </p>
                <code className="block text-xs font-mono text-foreground break-all leading-relaxed">
                  {token}
                </code>
              </div>
            )}

            {/* Common causes */}
            <div className="w-full rounded-2xl bg-muted/50 px-4 py-4 text-left space-y-2.5">
              <p className="text-xs font-medium text-foreground">よくある原因</p>
              <ul className="space-y-2">
                {[
                  'URLの一部が欠けている、または誤ってコピーされた',
                  '招待リンクがすでに削除されている',
                  'グループ自体が解散している',
                ].map((reason, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <span className="mt-0.5 shrink-0 text-muted-foreground/50 select-none">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              <Button
                size="sm"
                onClick={() => router.push('/')}
                className={cn(
                  'w-full gap-2 text-sm font-medium text-white',
                  accentConfig.bg,
                  accentConfig.bgHover
                )}
              >
                <Home size={13} />
                トップページへ戻る
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-full gap-2 text-sm font-medium"
              >
                <Copy size={13} />
                現在のURLをコピー
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed px-4">
          正しいリンクはグループのオーナーから再送してもらえます。
        </p>
      </div>
    </main>
  );
}
