import { VideoPlayer } from '@/components/layout/video-player';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Photo } from '@/db/schema';

interface AlbumDetailLightboxDialogProps {
  item: Photo | null;
  onClose: () => void;
}

export function AlbumDetailLightboxDialog({
  item,
  onClose,
}: AlbumDetailLightboxDialogProps) {
  if (!item) return null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
        {item.mediaType === 'video' ? (
          <VideoPlayer src={item.url} />
        ) : (
          <img
            src={`/api/photos/${item.id}/optimized?mode=full`}
            alt={item.alt}
            className="w-full h-auto object-contain rounded-lg"
            crossOrigin="anonymous"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
