'use client';

import { AlbumCard } from '@/components/album/album-card';
import { Album } from '@/db/schema';
import { type AccentColor, ACCENT_COLORS } from '@/lib/data';
import { MOCK_GROUPS } from '@/lib/settings-data';
import { cn } from '@/lib/utils';
import { Plus, Users } from 'lucide-react';

interface AlbumGridProps {
  albums: Album[];
  accent: AccentColor;
  onAlbumClick: (album: Album) => void;
  onCreateClick: () => void;
}

export function AlbumGrid({
  albums,
  accent,
  onAlbumClick,
  onCreateClick,
}: AlbumGridProps) {
  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;
  const activeGroup = MOCK_GROUPS[0];

  const personalCount = albums.filter((a) => a.type === 'personal').length;
  const familyCount = albums.filter((a) => a.type === 'family').length;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ページタイトル */}
      <div className="mb-7">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-sans text-2xl font-medium text-foreground tracking-wide text-balance">
            アルバム一覧
          </h1>
          {/* 現在のグループバッジ */}
          {activeGroup && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-sans',
                accentConfig.bgLight,
                accentConfig.text
              )}
            >
              <Users size={11} className="shrink-0" />
              {activeGroup.name}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          全{albums.length}冊 ·
          <span className="ml-1">個人{personalCount}冊</span>
          <span className="mx-1 text-muted-foreground/40">·</span>
          <span>共有{familyCount}冊</span>
        </p>
      </div>

      {/* グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            accent={accent}
            onClick={() => onAlbumClick(album)}
          />
        ))}
      </div>

      {/* 新規作成ボタン (FAB) */}
      <button
        onClick={onCreateClick}
        aria-label="新しいアルバムを作る"
        className={cn(
          'fixed bottom-6 right-6 h-13 w-13 rounded-full shadow-lg flex items-center justify-center',
          'transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          accentConfig.bg,
          accentConfig.bgHover,
          accentConfig.ring,
          'text-white'
        )}
      >
        <Plus size={22} strokeWidth={2} />
      </button>
    </main>
  );
}
