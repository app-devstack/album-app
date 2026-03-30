'use client';

import { AlbumMemos } from '@/components/album/album-memos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Album, Photo } from '@/db/schema';
import {
  useCreateMemo,
  useDeleteMemo,
  useMemos,
  useUpdateMemo,
} from '@/hooks/fetchers/use-memos';
import {
  useCreatePhoto,
  useDeletePhoto,
  usePhotos,
} from '@/hooks/fetchers/use-photos';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Edit2,
  Film,
  ImagePlus,
  MapPin,
  PlayCircle,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { AlbumDetailAddMediaCell } from './album-detail-add-media-cell';
import { AlbumDetailLightboxDialog } from './album-detail-lightbox-dialog';
import { AlbumDetailSettingsDialog } from './album-detail-settings-dialog';
import { AlbumDetailUploadingOverlay } from './album-detail-uploading-overlay';

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

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AlbumDetail({
  album,
  accent,
  onBack,
  onAlbumUpdate,
  onAlbumDelete,
}: AlbumDetailProps) {
  const { data: photos = [], isLoading: isLoadingPhotos } = usePhotos(album.id);
  const { mutateAsync: createPhotoMutation } = useCreatePhoto();
  const { mutateAsync: deletePhotoMutation } = useDeletePhoto();

  const { data: memos = [], isLoading: isLoadingMemos } = useMemos(album.id);
  const { mutateAsync: createMemoMutation } = useCreateMemo();
  const { mutateAsync: updateMemoMutation } = useUpdateMemo();
  const { mutateAsync: deleteMemoMutation } = useDeleteMemo();

  // Wrap createMemo to match component signature
  const handleCreateMemo = async (memo: {
    albumId: string;
    body: string;
    mood?: string;
  }) => {
    return createMemoMutation(memo);
  };

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<Photo | null>(null);
  const [editTitle, setEditTitle] = useState(album.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhotoMutation(photoId);
  };

  const handleAddMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const tempId = `${Date.now()}-${file.name}`;

      setUploadingItems((prev) => [...prev, { tempId, fileName: file.name }]);

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
      } catch {
        setUploadingItems((prev) =>
          prev.filter((item) => item.tempId !== tempId)
        );
      }
    }
    e.target.value = '';
  };

  const handleSaveSettings = async () => {
    await onAlbumUpdate({ id: album.id, title: editTitle });
    setSettingsOpen(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };
  // const imageCount = album.photoCount;
  const imageCount = photos.filter((p) => p.mediaType === 'image').length;
  const videoCount = photos.filter((p) => p.mediaType === 'video').length;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0 rounded-full"
          aria-label="アルバム一覧に戻る"
        >
          <ArrowLeft size={16} />
        </Button>

        <div className="flex-1 min-w-0 flex items-center gap-2 group">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 text-base font-sans font-medium py-0 px-2 w-56"
                autoFocus
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    await onAlbumUpdate({ id: album.id, title: editTitle });
                    setEditingTitle(false);
                  }
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={async () => {
                  await onAlbumUpdate({ id: album.id, title: editTitle });
                  setEditingTitle(false);
                }}
                aria-label="タイトルを保存"
              >
                <Check size={14} />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-sans text-xl font-medium text-foreground truncate tracking-wide">
                {album.title}
              </h1>
              <button
                onClick={() => setEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                aria-label="タイトルを編集"
              >
                <Edit2 size={12} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setSettingsOpen(true)}
            aria-label="アルバム設定"
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-44 sm:h-60 rounded-2xl overflow-hidden mb-6 bg-muted">
        {album.latestPhoto && (
          <img
            src={album.latestPhoto.thumbnailUrl || album.latestPhoto.url}
            alt={`${album.title}のカバー`}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white flex flex-col gap-1">
          <div className="flex items-center gap-3 text-xs text-white/75">
            {album.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {album.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays size={11} />
              {formatDate(album.createdAt)}
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

          {/* {album.type === 'family' && album.memberName && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Avatar className="h-5 w-5">
                {album.memberAvatar ? (
                  <AvatarImage
                    src={album.memberAvatar}
                    alt={album.memberName}
                  />
                ) : null}
                <AvatarFallback className="text-[9px]">
                  {album.memberName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs opacity-80">
                {album.memberName} が作成
              </span>
            </div>
          )} */}
        </div>
      </div>

      {isLoadingPhotos ? (
        <div>Loading photos...</div>
      ) : photos.length === 0 && uploadingItems.length === 0 ? (
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
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={13} />
            追加する
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {photos.map((item) => {
              const isVideo = item.mediaType === 'video';
              return (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setLightboxItem(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${isVideo ? '動画' : '写真'}を開く: ${item.alt}`}
                  onKeyDown={(e) => e.key === 'Enter' && setLightboxItem(item)}
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
                      <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                        {/* <Film size={32} className="text-muted-foreground" /> */}
                      </div>
                    )
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      crossOrigin="anonymous"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle
                        size={40}
                        className="text-white/80 drop-shadow-lg"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 text-white transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('この写真を削除してもよろしいですか？')) {
                        handleDeletePhoto(item.id);
                      }
                    }}
                    aria-label="写真を削除"
                  >
                    <X size={16} />
                  </Button>
                </div>
              );
            })}
            <AlbumDetailAddMediaCell
              onAddClick={() => fileInputRef.current?.click()}
            />
          </div>

          <AlbumDetailUploadingOverlay
            uploadingItems={uploadingItems}
            accentText={accentConfig.text}
          />
        </div>
      )}

      {isLoadingMemos ? (
        <div>Loading memos...</div>
      ) : (
        <AlbumMemos
          album={album}
          accentConfig={accentConfig}
          memos={memos}
          createMemo={handleCreateMemo}
          updateMemo={updateMemoMutation}
          deleteMemo={deleteMemoMutation}
        />
      )}

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
        onClose={() => setLightboxItem(null)}
      />

      <AlbumDetailSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        editTitle={editTitle}
        onEditTitleChange={setEditTitle}
        onSave={handleSaveSettings}
        onDelete={async () => {
          if (confirm('このアルバムを削除してもよろしいですか？')) {
            await onAlbumDelete(album.id);
            onBack();
          }
        }}
        accentBg={accentConfig.bg}
        accentBgHover={accentConfig.bgHover}
      />
    </main>
  );
}
