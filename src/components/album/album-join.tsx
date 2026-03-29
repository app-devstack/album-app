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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';

interface AlbumJoinProps {
  /** The invite token extracted from the URL */
  token: string;
  accent: AccentColor;
}

/** Stable mock album info derived from the invite token */
function deriveAlbumInfo(token: string) {
  const names = [
    '夏の思い出',
    '家族旅行 2024',
    '桜の季節',
    '卒業アルバム',
    '年末パーティー',
  ];
  const locations = ['東京', '京都', '大阪', '北海道', '沖縄'];
  const hosts = [
    { name: '田中 さくら', avatar: '' },
    { name: '山田 健太', avatar: '' },
    { name: '鈴木 美咲', avatar: '' },
  ];

  const code = (n: number) => token.charCodeAt(n) || 0;
  const idx = code(0) % names.length;
  const locIdx = code(1) % locations.length;
  const hostIdx = code(2) % hosts.length;
  const photoCount = 12 + code(3) % 88;
  const memberCount = 2 + code(4) % 6;

  return {
    title: names[idx],
    location: locations[locIdx],
    host: hosts[hostIdx],
    photoCount,
    memberCount,
    createdAt: '2024年8月3日',
    coverUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  };
}

// Dummy member avatars to show in the members row
const DUMMY_MEMBERS = [
  { name: '田中', avatar: '' },
  { name: '山田', avatar: '' },
  { name: '鈴木', avatar: '' },
  { name: '佐藤', avatar: '' },
];

type JoinState = 'idle' | 'loading' | 'joined';

export function AlbumJoin({ token, accent }: AlbumJoinProps) {
  const router = useRouter();
  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;
  const album = deriveAlbumInfo(token);
  const [joinState, setJoinState] = useState<JoinState>('idle');

  const handleJoin = async () => {
    setJoinState('loading');
    // Simulate network request
    await new Promise((res) => setTimeout(res, 1200));
    setJoinState('joined');
  };

  const handleGoToAlbum = () => {
    // In a real app this would navigate to the album that was joined
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col gap-0">

        {/* ── App logo / wordmark ── */}
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

        {/* ── Card ── */}
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">

          {/* Cover image */}
          <div className="relative h-44 bg-muted overflow-hidden">
            <img
              src={album.coverUrl}
              alt={`${album.title}のカバー`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            {/* Album title overlaid on cover */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-xl font-semibold text-white leading-tight text-balance drop-shadow-sm">
                {album.title}
              </h1>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 pt-5 pb-6 flex flex-col gap-5">

            {/* Invitation headline */}
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">招待メッセージ</p>
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-medium">{album.host.name}</span>
                {'さんがあなたをこのアルバムグループに招待しました。'}
              </p>
            </div>

            <Separator />

            {/* Album meta */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center',
                    accentConfig.bgLight
                  )}
                >
                  <ImageIcon size={14} className={accentConfig.text} />
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {album.photoCount}
                </span>
                <span className="text-[11px] text-muted-foreground">写真</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center',
                    accentConfig.bgLight
                  )}
                >
                  <Users size={14} className={accentConfig.text} />
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {album.memberCount}
                </span>
                <span className="text-[11px] text-muted-foreground">メンバー</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center',
                    accentConfig.bgLight
                  )}
                >
                  <CalendarDays size={14} className={accentConfig.text} />
                </div>
                <span className="text-[11px] font-semibold text-foreground leading-tight mt-0.5 text-center">
                  {album.createdAt}
                </span>
                <span className="text-[11px] text-muted-foreground">作成日</span>
              </div>
            </div>

            {/* Existing members avatars */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex -space-x-2">
                {DUMMY_MEMBERS.slice(0, album.memberCount).map((m, i) => (
                  <Avatar
                    key={i}
                    className="h-7 w-7 ring-2 ring-card"
                  >
                    {m.avatar ? (
                      <AvatarImage src={m.avatar} alt={m.name} />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        'text-[10px] font-medium',
                        accentConfig.bgLight,
                        accentConfig.text
                      )}
                    >
                      {m.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {album.memberCount > DUMMY_MEMBERS.length && (
                  <div
                    className={cn(
                      'h-7 w-7 rounded-full ring-2 ring-card flex items-center justify-center text-[9px] font-semibold',
                      accentConfig.bgLight,
                      accentConfig.text
                    )}
                  >
                    +{album.memberCount - DUMMY_MEMBERS.length}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {album.memberCount}人がすでに参加中
              </p>
            </div>

            <Separator />

            {/* CTA */}
            {joinState === 'joined' ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    'h-12 w-12 rounded-full flex items-center justify-center',
                    accentConfig.bgLight
                  )}
                >
                  <Check size={22} strokeWidth={2.5} className={accentConfig.text} />
                </div>
                <p className="text-sm font-medium text-foreground text-center">
                  グループに参加しました！
                </p>
                <Button
                  size="sm"
                  onClick={handleGoToAlbum}
                  className={cn(
                    'w-full gap-2 text-sm font-medium text-white',
                    accentConfig.bg,
                    accentConfig.bgHover
                  )}
                >
                  アルバムを見る
                  <ArrowRight size={14} />
                </Button>
              </div>
            ) : (
              <Button
                size="default"
                disabled={joinState === 'loading'}
                onClick={handleJoin}
                className={cn(
                  'w-full gap-2 text-sm font-medium text-white transition-all',
                  accentConfig.bg,
                  accentConfig.bgHover,
                  joinState === 'loading' && 'opacity-70 cursor-not-allowed'
                )}
              >
                {joinState === 'loading' ? (
                  <>
                    <span
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                      aria-hidden="true"
                    />
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

        {/* Footer note */}
        <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed px-4">
          参加すると、グループ内のすべての写真・動画にアクセスできます。
          <br />
          いつでも退出できます。
        </p>

      </div>
    </main>
  );
}
