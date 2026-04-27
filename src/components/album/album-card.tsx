'use client';

import { Album, Photo } from '@/db/schema';
import { albumCoverImageSrc } from '@/lib/album-cover';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { formatJapaneseDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { AlbumGridDensity } from '@/stores/albumListStore';
import { MapPin, Users } from 'lucide-react';

/** アルバムカードに渡すプロパティ。 */
interface AlbumCardProps {
  album: Album & { latestPhoto?: Photo | null };
  accent: AccentColor;
  onClick: () => void;
  gridDensity?: AlbumGridDensity; // compact 時はタイポ・余白を一段詰める
}

/** グリッド内の1アルバムをカード表示する。 */
export function AlbumCard({
  album,
  accent,
  onClick,
  gridDensity = 'comfortable',
}: AlbumCardProps) {
  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;
  const coverSrc = albumCoverImageSrc(album);

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      aria-label={`アルバムを開く: ${album.title}`}
    >
      {/* カバー画像 */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-muted">
        {coverSrc && (
          <img
            src={coverSrc}
            alt={`${album.title}のカバー`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        )}
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* タイプバッジ */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white',
              accentConfig.bg
            )}
          >
            <Users size={10} />
            共有
          </span>
        </div>
      </div>

      {/* カード情報 */}
      <div
        className={cn(
          'flex items-start justify-between gap-2',
          gridDensity === 'compact' ? 'mt-2' : 'mt-2.5'
        )}
      >
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'font-medium text-foreground truncate leading-snug',
              gridDensity === 'compact'
                ? 'text-xs sm:text-sm'
                : 'text-sm'
            )}
          >
            {album.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {album.location && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <MapPin size={9} className="shrink-0" />
                {album.location}
              </span>
            )}
            {album.location && (
              <span className="text-[11px] text-muted-foreground/50">·</span>
            )}

            {/* 写真の枚数 */}
            {/* <span className="text-[11px] text-muted-foreground">
              {album.photos.length}枚
            </span> */}

            {/* 作成日 */}
            <span className="text-[11px] text-muted-foreground">
              {formatJapaneseDate(album.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
