'use client';

import { Album, Photo } from '@/db/schema';
import { albumCoverImageSrc } from '@/lib/album-cover';
import { formatJapaneseDate } from '@/lib/date';
import { cn } from '@/lib/utils';

/** リスト行に渡すアルバム（一覧 API 拡張を含む）。 */
type AlbumListRowAlbum = Album & {
  latestPhoto?: Photo | null;
  photoCount?: number;
};

/** リスト行に渡すプロパティ。 */
interface AlbumListRowProps {
  album: AlbumListRowAlbum;
  onClick: () => void;
}

/** 副行テキスト（枚数・作成日）を組み立てる。 */
function buildListRowSubtitle(album: AlbumListRowAlbum): string {
  const photoCount = album.photoCount ?? 0;
  const parts: string[] = [`${photoCount}枚`];

  parts.push(`${formatJapaneseDate(album.createdAt)}`);

  return parts.join(' · ');
}

/** 一覧リストの1アルバム行（小カバー + タイトル・副情報）。 */
export function AlbumListRow({ album, onClick }: AlbumListRowProps) {
  const coverSrc = albumCoverImageSrc(album);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left',
        'transition-colors hover:bg-muted/60',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      aria-label={`アルバムを開く: ${album.title}`}
    >
      <div
        className={cn(
          'relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted',
          !coverSrc && 'border border-border/60'
        )}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-medium leading-snug text-foreground">
          {album.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {buildListRowSubtitle(album)}
        </p>
      </div>
    </button>
  );
}
