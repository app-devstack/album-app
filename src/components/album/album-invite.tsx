'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppIcon } from '@/components/layout/app-icon';
import { cn } from '@/lib/utils';

interface AlbumInviteProps {
  albumId: string;
}

export function AlbumInvite({ albumId }: AlbumInviteProps) {
  const router = useRouter();

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
      // Clipboard API not available
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-login-bg">
      <PetalDecoration />

      <div className="relative z-10 w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-login-card border border-login-border shadow-sm">
            <AppIcon size={38} className="text-login-accent" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-medium tracking-widest text-login-fg">
              思い出帳
            </h1>
            <p className="mt-1 text-xs font-sans text-login-muted tracking-wider">
              大切な記憶を、いつでも一緒に。
            </p>
          </div>
        </div>

        {/* 戻るボタン */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-login-muted hover:text-login-fg transition-colors mb-4 font-sans"
          aria-label="前のページに戻る"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          戻る
        </button>

        {/* カード */}
        <div className="bg-login-card border border-login-border rounded-2xl shadow-md px-7 py-7 flex flex-col gap-6">

          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold text-login-fg tracking-wide font-sans">
              アルバムに招待
            </h2>
            <p className="text-xs text-login-muted font-sans leading-relaxed">
              下記のリンクやコードを友達に共有しましょう
            </p>
          </div>

          {/* 区切り */}
          <div className="h-px bg-login-border" />

          {/* 招待リンク */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-login-accent text-[10px] font-bold text-login-accent-fg shrink-0">
                1
              </span>
              <span className="text-xs font-semibold text-login-label font-sans tracking-wide">
                招待リンク
              </span>
            </div>
            <p className="text-xs text-login-muted font-sans leading-relaxed">
              このリンクを共有すると、誰でもアルバムに参加できます。
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="flex-1 h-9 text-xs bg-login-input border-login-border text-login-muted focus-visible:ring-login-accent/20 truncate"
                aria-label="招待リンク"
              />
              <Button
                size="sm"
                onClick={() => handleCopy(inviteLink, 'link')}
                className={cn(
                  'shrink-0 h-9 gap-1.5 text-xs font-medium font-sans transition-all',
                  copiedLink
                    ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                    : 'bg-login-accent hover:bg-login-accent-hover text-login-accent-fg'
                )}
                aria-label="リンクをコピー"
              >
                {copiedLink ? (
                  <><Check size={12} />コピー済み！</>
                ) : (
                  <><Copy size={12} />コピー</>
                )}
              </Button>
            </div>
          </div>

          {/* QRコード */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-login-accent text-[10px] font-bold text-login-accent-fg shrink-0">
                2
              </span>
              <span className="text-xs font-semibold text-login-label font-sans tracking-wide">
                QRコード
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 py-3">
              <div
                className="h-40 w-40 rounded-xl border-2 border-dashed border-login-border bg-login-input flex flex-col items-center justify-center gap-2 text-login-muted"
                aria-label="QRコードプレースホルダー"
                role="img"
              >
                <QrCode size={48} strokeWidth={1.2} />
                <span className="text-[10px] font-medium font-sans opacity-70">
                  QR コード
                </span>
              </div>
              <p className="text-xs text-login-muted text-center font-sans leading-relaxed">
                このQRコードをスキャンして参加
              </p>
            </div>
          </div>

          {/* 招待コード */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-login-accent text-[10px] font-bold text-login-accent-fg shrink-0">
                3
              </span>
              <span className="text-xs font-semibold text-login-label font-sans tracking-wide">
                招待コード
              </span>
            </div>
            <p className="text-xs text-login-muted font-sans leading-relaxed">
              コードを直接入力してアルバムに参加できます。
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteCode}
                className="flex-1 h-9 text-sm font-mono tracking-[0.2em] bg-login-input border-login-border text-login-fg focus-visible:ring-login-accent/20"
                aria-label="招待コード"
              />
              <Button
                size="sm"
                onClick={() => handleCopy(inviteCode, 'code')}
                className={cn(
                  'shrink-0 h-9 gap-1.5 text-xs font-medium font-sans transition-all',
                  copiedCode
                    ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                    : 'bg-login-accent hover:bg-login-accent-hover text-login-accent-fg'
                )}
                aria-label="コードをコピー"
              >
                {copiedCode ? (
                  <><Check size={12} />コピー済み！</>
                ) : (
                  <><Copy size={12} />コピー</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* フッターノート */}
        <p className="text-center text-[11px] text-login-muted mt-6 leading-relaxed font-sans px-2">
          招待リンクは有効期限がありません。不要になった場合はアルバム設定から無効にできます。
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
    { top: '7%',  left: '6%',  size: 16, rotate: 20,  opacity: 0.16 },
    { top: '13%', left: '89%', size: 12, rotate: -15, opacity: 0.13 },
    { top: '30%', left: '2%',  size: 9,  rotate: 45,  opacity: 0.11 },
    { top: '54%', left: '92%', size: 15, rotate: 10,  opacity: 0.14 },
    { top: '73%', left: '4%',  size: 11, rotate: -30, opacity: 0.12 },
    { top: '83%', left: '83%', size: 8,  rotate: 60,  opacity: 0.10 },
    { top: '91%', left: '41%', size: 13, rotate: -10, opacity: 0.09 },
    { top: '3%',  left: '53%', size: 7,  rotate: 35,  opacity: 0.08 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
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
