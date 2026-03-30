import { cn } from '@/lib/utils';

interface UploadingItem {
  /** ローカルで識別するための仮ID */
  tempId: string;
  fileName: string;
}

interface AlbumDetailUploadingOverlayProps {
  uploadingItems: UploadingItem[];
  accentText: string;
}

export function AlbumDetailUploadingOverlay({
  uploadingItems,
  accentText,
}: AlbumDetailUploadingOverlayProps) {
  if (uploadingItems.length === 0) return null;
  return (
    <div
      className="absolute inset-0 rounded-xl bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10"
      aria-live="polite"
      aria-label="アップロード中"
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full animate-spin border-4 border-muted border-t-current',
          accentText
        )}
      />
      <p className={cn('text-sm font-medium', accentText)}>
        アップロード中… ({uploadingItems.length}件)
      </p>
    </div>
  );
}
