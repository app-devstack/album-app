'use client';

import { Button } from '@/components/ui/button';
import { AlbumMemoProvider } from '@/contexts/album-memo-context';
import { Album, Photo } from '@/db/schema';
import { albumKeys } from '@/hooks/fetchers/use-albums';
import {
  useCreatePhoto,
  useDeletePhoto,
  usePhotos,
} from '@/hooks/fetchers/use-photos';
import { albumCoverImageSrc, photoUrlForAlbumCover } from '@/lib/album-cover';
import {
  ACCENT_COLORS,
  type AccentColor,
  type AccentColorConfig,
} from '@/lib/data';
import { formatJapaneseDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  Film,
  ImagePlus,
  MapPin,
  Plus,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { AlbumDetailAddMediaCell } from './album-detail-add-media-cell';
import { AlbumDetailLightboxDialog } from './album-detail-lightbox-dialog';
import { AlbumDetailPhotoCell } from './album-detail-photo-cell';
import { AlbumDetailSettingsDialog } from './album-detail-settings-dialog';
import { AlbumDetailUploadingOverlay } from './album-detail-uploading-overlay';
import { AlbumDetailMemoSection } from './memos/album-detail-memo-section';

interface UploadingItem {
  /** ローカルで識別するための仮ID */
  tempId: string;
  fileName: string;
}

interface AlbumDetailProps {
  album: Album & { latestPhoto?: Photo | null };
  accent: AccentColor;
  onBack: () => void;
  onAlbumUpdate: (updated: Partial<Album> & { id: string }) => Promise<void>;
  onAlbumDelete: (id: string) => Promise<void>;
}

export function AlbumDetail({
  album,
  accent,
  onBack,
  onAlbumUpdate,
  onAlbumDelete,
}: AlbumDetailProps) {
  const queryClient = useQueryClient();
  const { data: photos = [], isLoading: isLoadingPhotos } = usePhotos(album.id);
  const { mutateAsync: createPhotoMutation } = useCreatePhoto();
  const { mutateAsync: deletePhotoMutation } = useDeletePhoto();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<Photo | null>(null);
  const [editTitle, setEditTitle] = useState(album.title);
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhotoMutation(photoId);
  };

  const handleAddMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // 全ファイルをアップロード中リストに追加
    const uploadTasks = files.map((file) => ({
      tempId: `${Date.now()}-${Math.random()}-${file.name}`,
      fileName: file.name,
      file,
    }));

    setUploadingItems((prev) => [
      ...prev,
      ...uploadTasks.map(({ tempId, fileName }) => ({ tempId, fileName })),
    ]);

    // 並列アップロード
    const results = await Promise.allSettled(
      uploadTasks.map(async ({ tempId, file }) => {
        const isVideo = file.type.startsWith('video/');
        try {
          await createPhotoMutation({
            albumId: album.id,
            file,
            alt: file.name.replace(/\.[^.]+$/, ''),
            mediaType: isVideo ? 'video' : 'image',
          });
          setUploadingItems((prev) =>
            prev.filter((item) => item.tempId !== tempId)
          );
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadingItems((prev) =>
            prev.filter((item) => item.tempId !== tempId)
          );
          throw error;
        }
      })
    );

    // 失敗したファイルがあればログ出力
    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`${failed.length}件のアップロードに失敗しました`);
    }

    const hasSuccess = results.some((r) => r.status === 'fulfilled');
    if (hasSuccess && !album.coverUrl) {
      // アルバム詳細の最新写真(latestPhoto)を更新するために再フェッチ
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(album.id) });
      if (album.groupId) {
        // 一覧画面に戻った際にも最新サムネイルが反映されるようにリストも無効化
        queryClient.invalidateQueries({
          queryKey: albumKeys.listGroupScope(album.groupId),
        });
      }
    }

    e.target.value = '';
  };

  const handleSaveSettings = async () => {
    await onAlbumUpdate({ id: album.id, title: editTitle });
    setSettingsOpen(false);
  };

  // const imageCount = album.photoCount;
  const imageCount = photos.filter((p) => p.mediaType === 'image').length;
  const videoCount = photos.filter((p) => p.mediaType === 'video').length;

  const coverImageSrc = albumCoverImageSrc(album);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <AlbumMemoProvider albumId={album.id}>
        <AlbumHeader
          title={album.title}
          onBack={onBack}
          onSettingsOpen={() => setSettingsOpen(true)}
        />

        <AlbumCover
          coverImageSrc={coverImageSrc}
          title={album.title}
          location={album.location}
          createdAt={album.createdAt}
          imageCount={imageCount}
          videoCount={videoCount}
        />

        <AlbumMediaGrid
          isLoadingPhotos={isLoadingPhotos}
          photos={photos}
          uploadingItems={uploadingItems}
          accentConfig={accentConfig}
          onAddClick={() => fileInputRef.current?.click()}
          onOpenLightbox={setLightboxItem}
        />

        <AlbumDetailMemoSection
          accentConfig={accentConfig}
          onAddPhoto={() => fileInputRef.current?.click()}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAddMedia}
          className="hidden"
          multiple
          accept="image/*,video/*"
        />

        <AlbumDetailLightboxDialog
          item={lightboxItem}
          accentText={accentConfig.text}
          onClose={() => setLightboxItem(null)}
          onDelete={async () => {
            if (!lightboxItem) return;
            await handleDeletePhoto(lightboxItem.id);
          }}
        />

        <AlbumDetailSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          editTitle={editTitle}
          onEditTitleChange={setEditTitle}
          onSave={handleSaveSettings}
          photos={photos}
          albumCoverUrl={album.coverUrl}
          onSetCoverUrl={async (coverUrl: string) => {
            await onAlbumUpdate({ id: album.id, coverUrl });
          }}
          photoUrlForCover={photoUrlForAlbumCover}
          onDelete={async () => {
            if (confirm('このアルバムを削除してもよろしいですか？')) {
              await onAlbumDelete(album.id);
              onBack();
            }
          }}
          accentBg={accentConfig.bg}
          accentBgHover={accentConfig.bgHover}
        />
      </AlbumMemoProvider>
    </main>
  );
}

interface AlbumMediaGridProps {
  isLoadingPhotos: boolean;
  photos: Photo[];
  uploadingItems: UploadingItem[];
  accentConfig: AccentColorConfig;
  onAddClick: () => void;
  onOpenLightbox: (item: Photo) => void;
}

function AlbumMediaGrid({
  isLoadingPhotos,
  photos,
  uploadingItems,
  accentConfig,
  onAddClick,
  onOpenLightbox,
}: AlbumMediaGridProps) {
  if (isLoadingPhotos) {
    return <div>Loading photos...</div>;
  }

  if (photos.length === 0 && uploadingItems.length === 0) {
    return (
      <EmptyMediaState accentConfig={accentConfig} onAddClick={onAddClick} />
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {photos.map((item) => (
          <AlbumDetailPhotoCell
            key={item.id}
            item={item}
            accentConfig={accentConfig}
            onOpen={onOpenLightbox}
          />
        ))}

        <AlbumDetailAddMediaCell onAddClick={onAddClick} />
      </div>

      <AlbumDetailUploadingOverlay
        uploadingItems={uploadingItems}
        accentText={accentConfig.text}
      />
    </div>
  );
}

interface AlbumCoverProps {
  coverImageSrc: string | null;
  title: string;
  location?: string | null;
  createdAt: string;
  imageCount: number;
  videoCount: number;
}

function AlbumCover({
  coverImageSrc,
  title,
  location,
  createdAt,
  imageCount,
  videoCount,
}: AlbumCoverProps) {
  return (
    <div className="relative w-full h-44 sm:h-60 rounded-2xl overflow-hidden bg-muted">
      {coverImageSrc && (
        <img
          src={coverImageSrc}
          alt={`${title}のカバー`}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-4 left-5 text-white flex flex-col gap-1">
        <div className="flex items-center gap-3 text-xs text-white/75">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays size={11} />
            {formatJapaneseDate(createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>{imageCount}枚の写真</span>
          {videoCount > 0 && (
            <>
              <span className="text-white/40">·</span>
              <span className="flex items-center gap-1">
                <Film size={12} />
                {videoCount}本の動画
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface EmptyMediaStateProps {
  accentConfig: AccentColorConfig;
  onAddClick: () => void;
}

function EmptyMediaState({ accentConfig, onAddClick }: EmptyMediaStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <ImagePlus size={22} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        まだメディアがありません
      </p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        写真や動画を追加しましょう。
      </p>
      <Button
        size="sm"
        className={cn(
          'mt-4 text-white gap-1.5',
          accentConfig.bg,
          accentConfig.bgHover
        )}
        onClick={onAddClick}
      >
        <Plus size={13} />
        追加する
      </Button>
    </div>
  );
}

/** アルバム詳細画面のヘッダーに渡すプロパティ。 */
interface AlbumHeaderProps {
  title: string; // アルバムのタイトル
  onBack: () => void; // 戻るボタンのクリックハンドラー
  onSettingsOpen: () => void; // 設定ボタンのクリックハンドラー
}

/** アルバム詳細画面の上部に表示するヘッダーコンポーネント。 */
function AlbumHeader({ title, onBack, onSettingsOpen }: AlbumHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="h-8 w-8 shrink-0 rounded-full"
        aria-label="アルバム一覧に戻る"
      >
        <ChevronLeftIcon size={16} className="size-6" />
      </Button>

      <div className="flex-1 min-w-0 flex items-center gap-2 group">
        <h1 className="font-sans text-xl font-medium text-foreground truncate tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onSettingsOpen}
          aria-label="アルバム設定"
        >
          <EllipsisVerticalIcon size={14} />
        </Button>
      </div>
    </div>
  );
}
