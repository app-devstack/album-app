'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';

interface AlbumInviteProps {
  albumId: string;
  accent: AccentColor;
}

export function AlbumInvite({ albumId, accent }: AlbumInviteProps) {
  const router = useRouter();
  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  // Derive stable invite data from albumId
  const inviteLink = `https://arubamu.app/join/${albumId}`;
  const inviteCode = albumId.slice(0, 8).toUpperCase();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch {
      // Clipboard API not available — silently ignore
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ページヘッダー */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 shrink-0 rounded-full"
            aria-label="前のページに戻る"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="font-sans text-base font-medium text-foreground tracking-wide">
            アルバムに招待
          </h1>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* 招待リンクカード */}
        <Card className="rounded-2xl shadow-sm border-border">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                  accentConfig.bgLight,
                  accentConfig.text
                )}
              >
                1
              </span>
              招待リンク
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              このリンクを共有すると、誰でもアルバムに参加できます。
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="flex-1 text-xs bg-muted/50 text-muted-foreground border-border focus-visible:ring-0 focus-visible:ring-offset-0 truncate"
                aria-label="招待リンク"
              />
              <Button
                size="sm"
                onClick={() => handleCopy(inviteLink, 'link')}
                className={cn(
                  'shrink-0 gap-1.5 text-xs text-white transition-all',
                  copiedLink
                    ? 'bg-emerald-500 hover:bg-emerald-500'
                    : cn(accentConfig.bg, accentConfig.bgHover)
                )}
                aria-label="リンクをコピー"
              >
                {copiedLink ? (
                  <>
                    <Check size={12} />
                    コピー済み！
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    コピー
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QRコードカード */}
        <Card className="rounded-2xl shadow-sm border-border">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                  accentConfig.bgLight,
                  accentConfig.text
                )}
              >
                2
              </span>
              QRコード
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex flex-col items-center gap-3 py-4">
              {/* QRコードプレースホルダー */}
              <div
                className={cn(
                  'h-44 w-44 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2',
                  accentConfig.bgLight,
                  'border-current',
                  accentConfig.text
                )}
                aria-label="QRコードプレースホルダー"
                role="img"
              >
                <QrCode size={56} strokeWidth={1.2} />
                <span className="text-[10px] font-medium opacity-70">
                  QR コード
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                このQRコードをスキャンしてアルバムに参加
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 招待コードカード */}
        <Card className="rounded-2xl shadow-sm border-border">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                  accentConfig.bgLight,
                  accentConfig.text
                )}
              >
                3
              </span>
              招待コード
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              コードを直接入力してアルバムに参加できます。
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteCode}
                className="flex-1 text-sm font-mono tracking-[0.2em] bg-muted/50 text-foreground border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="招待コード"
              />
              <Button
                size="sm"
                onClick={() => handleCopy(inviteCode, 'code')}
                className={cn(
                  'shrink-0 gap-1.5 text-xs text-white transition-all',
                  copiedCode
                    ? 'bg-emerald-500 hover:bg-emerald-500'
                    : cn(accentConfig.bg, accentConfig.bgHover)
                )}
                aria-label="コードをコピー"
              >
                {copiedCode ? (
                  <>
                    <Check size={12} />
                    コピー済み！
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    コピー
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* フッターノート */}
        <p className="text-center text-[11px] text-muted-foreground leading-relaxed px-2">
          招待リンクは有効期限がありません。不要になった場合はアルバム設定から無効にできます。
        </p>
      </div>
    </main>
  );
}
