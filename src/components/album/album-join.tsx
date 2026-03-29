'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CalendarDays,
  ImageIcon,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppIcon } from '@/components/layout/app-icon';
import { cn } from '@/lib/utils';

interface AlbumJoinProps {
  token: string;
}

function deriveAlbumInfo(token: string) {
  const names = [
    '夏の思い出',
    '家族旅行 2024',
    '桜の季節',
    '卒業アルバム',
    '年末パーティー',
  ];
  const hosts = [
    { name: '田中 さくら' },
    { name: '山田 健太' },
    { name: '鈴木 美咲' },
  ];

  const code = (n: number) => token.charCodeAt(n) || 0;
  const idx = code(0) % names.length;
  const hostIdx = code(2) % hosts.length;
  const photoCount = 12 + (code(3) % 88);
  const memberCount = 2 + (code(4) % 6);

  return {
    title: names[idx],
    host: hosts[hostIdx],
    photoCount,
    memberCount,
    createdAt: '2024年8月3日',
    coverUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  };
}

const DUMMY_MEMBERS = [
  { name: '田中' },
  { name: '山田' },
  { name: '鈴木' },
  { name: '佐藤' },
];

type JoinState = 'idle' | 'loading' | 'joined';

export function AlbumJoin({ token }: AlbumJoinProps) {
  const router = useRouter();
  const album = deriveAlbumInfo(token);
  const [joinState, setJoinState] = useState<JoinState>('idle');

  const handleJoin = async () => {
    setJoinState('loading');
    await new Promise((res) => setTimeout(res, 1200));
    setJoinState('joined');
  };

  const handleGoToAlbum = () => {
    router.push('/');
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

        {/* カード */}
        <div className="bg-login-card border border-login-border rounded-2xl shadow-md overflow-hidden">

          {/* カバー画像 */}
          <div className="relative h-44 overflow-hidden">
            <img
              src={album.coverUrl}
              alt={`${album.title}のカバー`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-[11px] text-white/70 font-sans mb-0.5">アルバムグループへの招待</p>
              <h2 className="text-xl font-semibold text-white leading-tight text-balance drop-shadow-sm font-sans">
                {album.title}
              </h2>
            </div>
          </div>

          {/* ボディ */}
          <div className="px-6 pt-5 pb-6 flex flex-col gap-5">

            {/* 招待メッセージ */}
            <p className="text-sm text-login-fg font-sans text-center leading-relaxed">
              <span className="font-semibold">{album.host.name}</span>
              {'さんがあなたをこのアルバムグループに招待しました。'}
            </p>

            <div className="h-px bg-login-border" />

            {/* アルバム情報グリッド */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-login-bg flex items-center justify-center border border-login-border">
                  <ImageIcon size={15} className="text-login-accent" />
                </div>
                <span className="text-sm font-semibold text-login-fg tabular-nums font-sans">
                  {album.photoCount}
                </span>
                <span className="text-[11px] text-login-muted font-sans">写真</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-login-bg flex items-center justify-center border border-login-border">
                  <Users size={15} className="text-login-accent" />
                </div>
                <span className="text-sm font-semibold text-login-fg tabular-nums font-sans">
                  {album.memberCount}
                </span>
                <span className="text-[11px] text-login-muted font-sans">メンバー</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-login-bg flex items-center justify-center border border-login-border">
                  <CalendarDays size={15} className="text-login-accent" />
                </div>
                <span className="text-[11px] font-semibold text-login-fg leading-tight mt-0.5 font-sans">
                  {album.createdAt}
                </span>
                <span className="text-[11px] text-login-muted font-sans">作成日</span>
              </div>
            </div>

            {/* メンバーアバター */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex -space-x-2">
                {DUMMY_MEMBERS.slice(0, Math.min(album.memberCount, 4)).map((m, i) => (
                  <Avatar key={i} className="h-7 w-7 ring-2 ring-login-card">
                    <AvatarImage src="" alt={m.name} />
                    <AvatarFallback className="text-[10px] font-medium bg-login-bg text-login-accent border border-login-border">
                      {m.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {album.memberCount > 4 && (
                  <div className="h-7 w-7 rounded-full ring-2 ring-login-card bg-login-bg border border-login-border flex items-center justify-center text-[9px] font-semibold text-login-muted">
                    +{album.memberCount - 4}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-login-muted font-sans">
                {album.memberCount}人がすでに参加中
              </p>
            </div>

            <div className="h-px bg-login-border" />

            {/* CTA */}
            {joinState === 'joined' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-login-bg border border-login-border flex items-center justify-center">
                  <Check size={22} strokeWidth={2.5} className="text-login-accent" />
                </div>
                <p className="text-sm font-medium text-login-fg text-center font-sans">
                  グループに参加しました！
                </p>
                <Button
                  onClick={handleGoToAlbum}
                  className="w-full h-11 gap-2 text-sm font-medium font-sans tracking-wider bg-login-accent hover:bg-login-accent-hover text-login-accent-fg rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                  アルバムを見る
                  <ArrowRight size={14} />
                </Button>
              </div>
            ) : (
              <Button
                disabled={joinState === 'loading'}
                onClick={handleJoin}
                className={cn(
                  'w-full h-11 gap-2 text-sm font-medium font-sans tracking-wider',
                  'bg-login-accent hover:bg-login-accent-hover text-login-accent-fg',
                  'rounded-lg shadow-sm transition-all active:scale-[0.98]',
                  joinState === 'loading' && 'opacity-70 cursor-not-allowed'
                )}
              >
                {joinState === 'loading' ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-login-accent-fg/30 border-t-login-accent-fg animate-spin" aria-hidden="true" />
                    参加中…
                  </>
                ) : (
                  <>
                    <Users size={15} />
                    アルバムグループに参加
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-login-muted mt-5 leading-relaxed font-sans px-4">
          参加すると、グループ内のすべての写真・動画にアクセスできます。
          <br />
          いつでも退出できます。
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
