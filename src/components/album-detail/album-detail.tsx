'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loading } from '@/components/ui/loading';
import { AlbumMemoProvider } from '@/contexts/album-memo-context';
import { Album, Photo } from '@/db/schema';
import { albumKeys } from '@/hooks/fetchers/use-albums';
import {
  photoKeys,
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
import {
  isNative,
  sendToNative,
  type NativePendingUploadItem,
} from '@/lib/native-bridge';
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
  Settings2,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlbumDetailAddMediaCell } from './album-detail-add-media-cell';
import { AlbumDetailAddMediaDialog } from './album-detail-add-media-dialog';
import { AlbumDetailDeleteDialog } from './album-detail-delete-dialog';
import { AlbumDetailLightboxDialog } from './album-detail-lightbox-dialog';
import { AlbumDetailPendingPhotoCell } from './album-detail-pending-photo-cell';
import { AlbumDetailPendingUploadDeleteDialog } from './album-detail-pending-upload-delete-dialog';
import { AlbumDetailPendingUploadRetryDialog } from './album-detail-pending-upload-retry-dialog';
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
  /** クエリ `photo` の値。ライトボックス表示と同期する。 */
  lightboxPhotoId: string | null;
  /** グリッド等からライトボックスを開く（履歴に push）。 */
  onOpenLightbox: (photoId: string) => void;
  /** ライトボックスを閉じる（push 経路は back、直リンク等は replace）。 */
  onCloseLightbox: () => void;
  /** 存在しない photo ID のときクエリだけ除去する。 */
  onStripInvalidPhotoQuery: () => void;
  onBack: () => void;
  onAlbumUpdate: (updated: Partial<Album> & { id: string }) => Promise<void>;
  onAlbumDelete: (id: string) => Promise<void>;
}

export function AlbumDetail({
  album,
  accent,
  lightboxPhotoId,
  onOpenLightbox,
  onCloseLightbox,
  onStripInvalidPhotoQuery,
  onBack,
  onAlbumUpdate,
  onAlbumDelete,
}: AlbumDetailProps) {
  const queryClient = useQueryClient();
  const { data: photos = [], isLoading: isLoadingPhotos } = usePhotos(album.id);
  const { mutateAsync: createPhotoMutation } = useCreatePhoto();
  const { mutateAsync: deletePhotoMutation } = useDeletePhoto();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(album.title);
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);
  const [pendingUploads, setPendingUploads] = useState<
    NativePendingUploadItem[]
  >([]);
  const [retryDialogItemId, setRetryDialogItemId] = useState<string | null>(
    null
  );
  const [retryDialogMode, setRetryDialogMode] = useState<
    'failed' | 'pending-retry' | null
  >(null);
  const lastPendingNetworkTapIdRef = useRef<string | null>(null);
  const [cancelConfirmItemId, setCancelConfirmItemId] = useState<string | null>(
    null
  );
  const [addMediaDialogOpen, setAddMediaDialogOpen] = useState(false);
  /** ファイル確定〜バッチ完了まで。ダイアログクローズや二重取得を抑止する。 */
  const [mediaUploadInProgress, setMediaUploadInProgress] = useState(false);
  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  const lightboxItem = useMemo(() => {
    if (!lightboxPhotoId) return null;
    return photos.find((p) => p.id === lightboxPhotoId) ?? null;
  }, [lightboxPhotoId, photos]);

  useEffect(() => {
    if (!lightboxPhotoId || isLoadingPhotos) return;
    if (photos.some((p) => p.id === lightboxPhotoId)) return;
    onStripInvalidPhotoQuery();
  }, [isLoadingPhotos, lightboxPhotoId, onStripInvalidPhotoQuery, photos]);

  useEffect(() => {
    if (isNative()) {
      sendToNative({ type: 'GET_PENDING_UPLOADS', albumId: album.id });
      setPendingUploads([]);
    }

    const onUploadQueued = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          albumId: string;
          item?: NativePendingUploadItem;
        }>
      ).detail;
      if (!detail || detail.albumId !== album.id || !detail.item) return;
      const item = detail.item;
      setPendingUploads((prev) => {
        const nextItem: NativePendingUploadItem = {
          ...item,
          status: item.status ?? 'pending',
        };
        const index = prev.findIndex((pending) => pending.id === nextItem.id);
        if (index === -1) return [...prev, nextItem];
        const next = [...prev];
        next[index] = nextItem;
        return next;
      });
    };

    const onPendingUploads = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          albumId: string;
          items: NativePendingUploadItem[];
        }>
      ).detail;
      if (!detail || detail.albumId !== album.id) return;
      setPendingUploads(
        detail.items.map((item) => ({
          ...item,
          status: item.status ?? 'pending',
        }))
      );
    };

    const onUploadComplete = (e: Event) => {
      const detail = (e as CustomEvent<{ albumId: string; id?: string }>)
        .detail;
      if (detail?.albumId && detail.albumId !== album.id) return;
      if (isNative() && detail?.id) {
        setPendingUploads((prev) =>
          prev.filter((pending) => pending.id !== detail.id)
        );
      }
      queryClient.invalidateQueries({ queryKey: photoKeys.lists(album.id) });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(album.id) });
    };

    const onUploadFailed = (e: Event) => {
      const detail = (e as CustomEvent<{ albumId: string; id: string }>).detail;
      if (!detail || detail.albumId !== album.id) return;
      setPendingUploads((prev) =>
        prev.map((pending) =>
          pending.id === detail.id
            ? { ...pending, status: 'failed' as const }
            : pending
        )
      );
    };

    const onUploadCancelled = (e: Event) => {
      const detail = (e as CustomEvent<{ albumId: string; id: string }>).detail;
      if (!detail || detail.albumId !== album.id) return;
      setPendingUploads((prev) =>
        prev.filter((pending) => pending.id !== detail.id)
      );
    };

    const onNetworkState = (e: Event) => {
      const onWifi =
        (e as CustomEvent<{ onWifi: boolean }>).detail?.onWifi === true;
      const id = lastPendingNetworkTapIdRef.current;
      if (!id) return;
      lastPendingNetworkTapIdRef.current = null;
      if (onWifi) {
        setRetryDialogMode('pending-retry');
        setRetryDialogItemId(id);
      } else {
        setCancelConfirmItemId(id);
      }
    };

    if (isNative()) {
      window.addEventListener('native:uploadQueued', onUploadQueued);
      window.addEventListener('native:pendingUploads', onPendingUploads);
      window.addEventListener('native:uploadFailed', onUploadFailed);
      window.addEventListener('native:uploadCancelled', onUploadCancelled);
      window.addEventListener('native:networkState', onNetworkState);
    }
    window.addEventListener('native:uploadComplete', onUploadComplete);

    return () => {
      if (isNative()) {
        window.removeEventListener('native:uploadQueued', onUploadQueued);
        window.removeEventListener('native:pendingUploads', onPendingUploads);
        window.removeEventListener('native:uploadFailed', onUploadFailed);
        window.removeEventListener('native:uploadCancelled', onUploadCancelled);
        window.removeEventListener('native:networkState', onNetworkState);
      }
      window.removeEventListener('native:uploadComplete', onUploadComplete);
    };
  }, [album.id, queryClient]);

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhotoMutation(photoId);
  };

  const handleRetryPendingUpload = (id: string) => {
    setRetryDialogItemId(null);
    setRetryDialogMode(null);
    setPendingUploads((prev) =>
      prev.map((pending) =>
        pending.id === id ? { ...pending, status: 'pending' as const } : pending
      )
    );
    sendToNative({ type: 'RETRY_PENDING_UPLOAD', id });
  };

  const handleRequestCancelPendingUpload = (id: string) => {
    setRetryDialogItemId(null);
    setRetryDialogMode(null);
    setCancelConfirmItemId(id);
  };

  const handlePendingUploadPress = (item: NativePendingUploadItem) => {
    if (item.status === 'failed') {
      setRetryDialogMode('failed');
      setRetryDialogItemId(item.id);
      return;
    }
    lastPendingNetworkTapIdRef.current = item.id;
    sendToNative({ type: 'GET_NETWORK_STATE' });
  };

  const handleConfirmCancelPendingUpload = () => {
    const id = cancelConfirmItemId;
    setCancelConfirmItemId(null);
    if (!id) return;
    setPendingUploads((prev) => prev.filter((pending) => pending.id !== id));
    sendToNative({ type: 'CANCEL_PENDING_UPLOAD', id });
  };

  const handleAddMediaBatch = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: 'image' | 'video'
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const addedAtBase = Date.now();
    const mediaType = mode === 'video' ? 'video' : 'image';

    const uploadTasks = files.map((file) => ({
      tempId: `${Date.now()}-${Math.random()}-${file.name}`,
      fileName: file.name,
      file,
    }));

    setMediaUploadInProgress(true);
    setUploadingItems((prev) => [
      ...prev,
      ...uploadTasks.map(({ tempId, fileName }) => ({ tempId, fileName })),
    ]);

    try {
      const results = await Promise.allSettled(
        uploadTasks.map(async ({ tempId, file }, index) => {
          try {
            await createPhotoMutation({
              albumId: album.id,
              file,
              alt: file.name.replace(/\.[^.]+$/, ''),
              mediaType,
              ...(mode === 'image'
                ? {
                    addedAt: new Date(addedAtBase + index).toISOString(),
                  }
                : {}),
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

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        console.warn(`${failed.length}件のアップロードに失敗しました`);
      }

      const hasSuccess = results.some((r) => r.status === 'fulfilled');
      if (hasSuccess && !album.coverUrl) {
        queryClient.invalidateQueries({ queryKey: albumKeys.detail(album.id) });
        if (album.groupId) {
          queryClient.invalidateQueries({
            queryKey: albumKeys.listGroupScope(album.groupId),
          });
        }
      }
    } finally {
      setMediaUploadInProgress(false);
      setAddMediaDialogOpen(false);
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
          onEditOpen={() => setSettingsOpen(true)}
          onDeleteOpen={() => setDeleteOpen(true)}
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
          pendingUploads={pendingUploads}
          accentConfig={accentConfig}
          onAddClick={() => setAddMediaDialogOpen(true)}
          onOpenLightbox={(item) => onOpenLightbox(item.id)}
          onPendingUploadPress={handlePendingUploadPress}
        />

        <AlbumDetailMemoSection
          accentConfig={accentConfig}
          onAddPhoto={() => setAddMediaDialogOpen(true)}
        />

        {/* 写真・動画追加用ダイアログ */}
        <AlbumDetailAddMediaDialog
          open={addMediaDialogOpen}
          onOpenChange={setAddMediaDialogOpen}
          mediaUploadInProgress={mediaUploadInProgress}
          accentConfig={accentConfig}
          onImageChange={(ev) => void handleAddMediaBatch(ev, 'image')}
          onVideoChange={(ev) => void handleAddMediaBatch(ev, 'video')}
          onNativePick={(mediaType) => {
            sendToNative({
              type: 'OPEN_PICKER',
              albumId: album.id,
              mediaType,
            });
            setAddMediaDialogOpen(false);
          }}
        />

        {/* 写真・動画の拡大表示用ダイアログ */}
        <AlbumDetailLightboxDialog
          item={lightboxItem}
          accentText={accentConfig.text}
          onClose={onCloseLightbox}
          onDelete={async () => {
            if (!lightboxItem) return;
            await handleDeletePhoto(lightboxItem.id);
          }}
        />

        {/* アルバム設定（タイトル・カバー）用ダイアログ */}
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
          accentBg={cn(accentConfig.bg, accentConfig.bgHover)}
        />

        {/* アルバム削除確認用ダイアログ */}
        <AlbumDetailDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDelete={async () => {
            await onAlbumDelete(album.id);
            onBack();
          }}
        />

        {/* 送信待ちの再送・取消用ダイアログ */}
        <AlbumDetailPendingUploadRetryDialog
          open={retryDialogItemId != null}
          onOpenChange={(open) => {
            if (!open) {
              setRetryDialogItemId(null);
              setRetryDialogMode(null);
            }
          }}
          mode={retryDialogMode ?? 'failed'}
          onCancelPending={() => {
            if (retryDialogItemId) {
              handleRequestCancelPendingUpload(retryDialogItemId);
            }
          }}
          onRetry={() => {
            if (retryDialogItemId) {
              handleRetryPendingUpload(retryDialogItemId);
            }
          }}
        />

        {/* 送信待ち削除の最終確認用ダイアログ */}
        <AlbumDetailPendingUploadDeleteDialog
          open={cancelConfirmItemId != null}
          onOpenChange={(open) => {
            if (!open) setCancelConfirmItemId(null);
          }}
          onConfirm={handleConfirmCancelPendingUpload}
        />
      </AlbumMemoProvider>
    </main>
  );
}

interface AlbumMediaGridProps {
  isLoadingPhotos: boolean;
  photos: Photo[];
  uploadingItems: UploadingItem[];
  pendingUploads: NativePendingUploadItem[];
  accentConfig: AccentColorConfig;
  onAddClick: () => void;
  onOpenLightbox: (item: Photo) => void;
  onPendingUploadPress: (item: NativePendingUploadItem) => void;
}

function AlbumMediaGrid({
  isLoadingPhotos,
  photos,
  uploadingItems,
  pendingUploads,
  accentConfig,
  onAddClick,
  onOpenLightbox,
  onPendingUploadPress,
}: AlbumMediaGridProps) {
  if (isLoadingPhotos) {
    return (
      <Loading
        variant="section"
        message="写真を読み込み中..."
        className="py-16"
      />
    );
  }

  if (
    photos.length === 0 &&
    uploadingItems.length === 0 &&
    pendingUploads.length === 0
  ) {
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

        {pendingUploads.map((item) => (
          <AlbumDetailPendingPhotoCell
            key={item.id}
            previewDataUrl={item.previewDataUrl}
            mediaType={item.mediaType}
            status={item.status ?? 'pending'}
            onPress={() => onPendingUploadPress(item)}
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
  title: string;
  onBack: () => void;
  /** 編集（設定）ダイアログを開く。 */
  onEditOpen: () => void;
  /** 削除確認ダイアログを開く。 */
  onDeleteOpen: () => void;
}

/** アルバム詳細画面の上部に表示するヘッダーコンポーネント。 */
function AlbumHeader({
  title,
  onBack,
  onEditOpen,
  onDeleteOpen,
}: AlbumHeaderProps) {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label="アルバムのオプション"
            >
              <EllipsisVerticalIcon size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <DropdownMenuItem
              className="cursor-pointer gap-2 py-3 text-base"
              onSelect={() => onEditOpen()}
            >
              <Settings2 className="shrink-0" />
              アルバムを編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2 py-3 text-base"
              onSelect={() => onDeleteOpen()}
            >
              <Trash2 className="shrink-0" />
              アルバムを削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
