'use client';

import { AppTitle } from '@/components/layout/app-title';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useJoinGroup, useJoinInfo } from '@/hooks/fetchers/use-join';
import { formatJapaneseDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ImageIcon,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface GroupJoinProps {
  token: string;
}

type JoinState = 'idle' | 'loading' | 'joined';

export function GroupJoin({ token }: GroupJoinProps) {
  const router = useRouter();
  const { data: group } = useJoinInfo(token);
  const { mutateAsync: joinGroup } = useJoinGroup();
  const [joinState, setJoinState] = useState<JoinState>('idle');

  const LOADING_GROUP = {
    name: '読み込み中...',
    coverUrl: '/img/album-app-join-cover-img.jpg',
    inviter: { name: '…', image: null as string | null },
    photoCount: 0,
    memberCount: 0,
    createdAt: new Date().toISOString(),
  };

  const displayGroup = group ?? LOADING_GROUP;

  const createdAtDisplay =
    displayGroup.createdAt.trim().length > 0
      ? formatJapaneseDate(displayGroup.createdAt)
      : '—';

  const handleJoin = async () => {
    setJoinState('loading');
    try {
      await joinGroup({ token });
      setJoinState('joined');
    } catch {
      setJoinState('idle');
    }
  };

  const handleGoToGroup = () => {
    // グループに属する最初のアルバムへ遷移（暫定: トップページ）
    // TODO: グループページ（/groups/:groupId）実装後に変更
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-login-bg">
      <PetalDecoration />

      <div className="relative z-10 w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <AppTitle />

        {/* カード */}
        <div className="bg-login-card border border-login-border rounded-2xl shadow-md overflow-hidden">
          {/* カバー画像 */}
          <div className="relative h-44 overflow-hidden">
            <img
              src={displayGroup.coverUrl || '/img/album-app-join-cover-img.jpg'}
              alt={`${displayGroup.name}のカバー`}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-[11px] text-white/70 font-sans mb-0.5">
                グループへの招待
              </p>
              <h2 className="text-xl font-semibold text-white leading-tight text-balance drop-shadow-sm font-sans">
                {displayGroup.name}
              </h2>
            </div>
          </div>

          {/* ボディ */}
          <div className="px-6 pt-5 pb-6 flex flex-col gap-5">
            {/* 招待メッセージ */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <p className="text-sm text-login-fg font-sans text-left leading-relaxed text-balance">
                  <span className="font-semibold">
                    {displayGroup.inviter.name}
                  </span>
                  さんが
                  <br />
                  あなたをこのグループに招待しました。
                </p>

                <Avatar className=" shrink-0 border ring-login-border">
                  <AvatarImage
                    src={displayGroup.inviter.image ?? undefined}
                    alt=""
                  />
                  <AvatarFallback className="text-xs font-medium bg-login-bg text-login-accent border border-login-border">
                    {displayGroup.inviter.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="h-px bg-login-border" />

            {/* アルバム情報グリッド */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-login-bg flex items-center justify-center border border-login-border">
                  <ImageIcon size={15} className="text-login-accent" />
                </div>
                <span className="text-sm font-semibold text-login-fg tabular-nums font-sans">
                  {displayGroup.photoCount}
                </span>
                <span className="text-[11px] text-login-muted font-sans">
                  写真
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-login-bg flex items-center justify-center border border-login-border">
                  <Users size={15} className="text-login-accent" />
                </div>
                <span className="text-sm font-semibold text-login-fg tabular-nums font-sans">
                  {displayGroup.memberCount}
                </span>
                <span className="text-[11px] text-login-muted font-sans">
                  メンバー
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-login-bg flex items-center justify-center border border-login-border">
                  <CalendarDays size={15} className="text-login-accent" />
                </div>
                <span className="text-[11px] font-semibold text-login-fg leading-tight mt-0.5 font-sans">
                  {createdAtDisplay}
                </span>
                <span className="text-[11px] text-login-muted font-sans">
                  作成日
                </span>
              </div>
            </div>

            {/* メンバーアバター */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex -space-x-2">
                {Array.from({
                  length: Math.min(displayGroup.memberCount, 4),
                }).map((_, i) => (
                  <Avatar key={i} className="h-7 w-7 ring-2 ring-login-card">
                    <AvatarImage src="" alt="メンバー" />
                    <AvatarFallback className="text-[10px] font-medium bg-login-bg text-login-accent border border-login-border">
                      M
                    </AvatarFallback>
                  </Avatar>
                ))}
                {displayGroup.memberCount > 4 && (
                  <div className="h-7 w-7 rounded-full ring-2 ring-login-card bg-login-bg border border-login-border flex items-center justify-center text-[9px] font-semibold text-login-muted">
                    +{displayGroup.memberCount - 4}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-login-muted font-sans">
                {displayGroup.memberCount}人がすでに参加中
              </p>
            </div>

            <div className="h-px bg-login-border" />

            {/* CTA */}
            {joinState === 'joined' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-login-bg border border-login-border flex items-center justify-center">
                  <Check
                    size={22}
                    strokeWidth={2.5}
                    className="text-login-accent"
                  />
                </div>
                <p className="text-sm font-medium text-login-fg text-center font-sans">
                  グループに参加しました！
                </p>
                <Button
                  onClick={handleGoToGroup}
                  className="w-full h-11 gap-2 text-sm font-medium font-sans tracking-wider bg-login-accent hover:bg-login-accent-hover text-login-accent-fg rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                  グループを見る
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
                    <span
                      className="h-4 w-4 rounded-full border-2 border-login-accent-fg/30 border-t-login-accent-fg animate-spin"
                      aria-hidden="true"
                    />
                    参加中…
                  </>
                ) : (
                  <>
                    <Users size={15} />
                    グループに参加
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
    { top: '7%', left: '6%', size: 16, rotate: 20, opacity: 0.16 },
    { top: '13%', left: '89%', size: 12, rotate: -15, opacity: 0.13 },
    { top: '30%', left: '2%', size: 9, rotate: 45, opacity: 0.11 },
    { top: '54%', left: '92%', size: 15, rotate: 10, opacity: 0.14 },
    { top: '73%', left: '4%', size: 11, rotate: -30, opacity: 0.12 },
    { top: '83%', left: '83%', size: 8, rotate: 60, opacity: 0.1 },
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
