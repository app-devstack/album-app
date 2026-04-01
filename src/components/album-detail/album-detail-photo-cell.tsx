import { Photo } from '@/db/schema';
import { AccentColorConfig } from '@/lib/data';
import { cn } from '@/lib/utils';
import { PlayCircleIcon } from 'lucide-react';

interface AlbumDetailPhotoCellProps {
  item: Photo;
  accentConfig: AccentColorConfig;
  onOpen: (item: Photo) => void;
}

export function AlbumDetailPhotoCell({
  item,
  accentConfig,
  onOpen,
}: AlbumDetailPhotoCellProps) {
  const isVideo = item.mediaType === 'video';
  return (
    <div
      className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
      onClick={() => onOpen(item)}
      role="button"
      tabIndex={0}
      aria-label={`${isVideo ? '動画' : '写真'}を開く: ${item.alt}`}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}
    >
      {isVideo ? (
        item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full bg-foreground/5 flex items-center justify-center',
              'opacity-40',
              accentConfig.bg
            )}
          >
            {/* <Film size={32} className="text-muted-foreground" /> */}
          </div>
        )
      ) : (
        <img
          src={`/api/photos/${item.id}/optimized?mode=thumb`}
          alt={item.alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          crossOrigin="anonymous"
        />
      )}

      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircleIcon
            size={40}
            className="text-white/80 drop-shadow-lg"
            strokeWidth={1.5}
          />
        </div>
      )}
    </div>
  );
}
