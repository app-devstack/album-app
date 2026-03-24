'use client';

import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  User,
  Settings,
  ImagePlus,
  X,
  Check,
  Edit2,
  MapPin,
  CalendarDays,
  PlayCircle,
  Film,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ACCENT_COLORS,
  COVER_OPTIONS,
  type Album,
  type AccentColor,
  type Photo,
  type Memo,
} from '@/lib/data';
import { VideoPlayer } from '@/components/video-player';
import { AlbumMemos } from '@/components/album-memos';
import { cn } from '@/lib/utils';

interface AlbumDetailProps {
  album: Album;
  accent: AccentColor;
  onBack: () => void;
  onAlbumUpdate: (updated: Album) => void;
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
}: AlbumDetailProps) {
  const [photos, setPhotos] = useState<Photo[]>(album.photos);
  const [memos, setMemos] = useState<Memo[]>(album.memos ?? []);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<Photo | null>(null);
  const [editTitle, setEditTitle] = useState(album.title);
  const [editCover, setEditCover] = useState(album.coverUrl);
  const [editingTitle, setEditingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  const handleDeletePhoto = (photoId: string) => {
    const updated = photos.filter((p) => p.id !== photoId);
    setPhotos(updated);
    onAlbumUpdate({ ...album, photos: updated, photoCount: updated.length });
  };

  const handleAddMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newItems: Photo[] = files.map((file) => {
      const isVideo = file.type.startsWith('video/');
      return {
        id: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^.]+$/, ''),
        addedAt: new Date().toISOString().split('T')[0],
        mediaType: isVideo ? 'video' : 'image',
      };
    });
    const updated = [...photos, ...newItems];
    setPhotos(updated);
    onAlbumUpdate({ ...album, photos: updated, photoCount: updated.length });
    e.target.value = '';
  };

  const handleSaveSettings = () => {
    onAlbumUpdate({
      ...album,
      title: editTitle,
      coverUrl: editCover,
      photos,
      photoCount: photos.length,
    });
    setSettingsOpen(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const videoCount = photos.filter((p) => p.mediaType === 'video').length;
  const imageCount = photos.length - videoCount;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* 戻るボタン + タイトルバー */}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onAlbumUpdate({ ...album, title: editTitle });
                    setEditingTitle(false);
                  }
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => {
                  onAlbumUpdate({ ...album, title: editTitle });
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
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium',
              album.type === 'family'
                ? cn(accentConfig.bgLight, accentConfig.text)
                : 'bg-muted text-muted-foreground'
            )}
          >
            {album.type === 'family' ? <Users size={10} /> : <User size={10} />}
            {album.type === 'family' ? '共有' : '非公開'}
          </span>
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

      {/* ヒーローカバー */}
      <div className="relative w-full h-44 sm:h-60 rounded-2xl overflow-hidden mb-6 bg-muted">
        <img
          src={album.coverUrl}
          alt={`${album.title}のカバー`}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
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
          {album.type === 'family' && album.memberName && (
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
          )}
        </div>
      </div>

      {/* メディアグリッド */}
      {photos.length === 0 ? (
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
                      <Film size={32} className="text-muted-foreground" />
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

                {isVideo && (
                  <>
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <PlayCircle
                          size={22}
                          className="text-white"
                          fill="white"
                        />
                      </div>
                    </div>
                    {item.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded tabular-nums">
                        {formatDuration(item.duration)}
                      </span>
                    )}
                  </>
                )}

                {!isVideo && item.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-2 pt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-[11px] text-white leading-tight line-clamp-2">
                      {item.caption}
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(item.id);
                  }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label={`削除: ${item.alt}`}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="写真・動画を追加"
          >
            <Plus size={18} />
            <span className="text-xs">追加</span>
          </button>
        </div>
      )}

      {/* メモセクション */}
      <div className="mt-10 pt-8 border-t border-border">
        <AlbumMemos
          memos={memos}
          accentConfig={accentConfig}
          onChange={(updated) => {
            setMemos(updated);
            onAlbumUpdate({ ...album, photos, memos: updated });
          }}
        />
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        onChange={handleAddMedia}
        aria-label="写真または動画をアップロード"
      />

      {/* ライトボックス */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/93 flex flex-col items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-label={`${lightboxItem.mediaType === 'video' ? '動画' : '写真'}を表示中: ${lightboxItem.alt}`}
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
            onClick={() => setLightboxItem(null)}
            aria-label="閉じる"
          >
            <X size={16} />
          </button>

          <div
            className="w-full max-w-3xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxItem.mediaType === 'video' ? (
              <VideoPlayer
                src={lightboxItem.url}
                caption={lightboxItem.caption}
                accentBg={accentConfig.bg}
              />
            ) : (
              <img
                src={lightboxItem.url}
                alt={lightboxItem.alt}
                className="max-w-full max-h-[82vh] rounded-lg object-contain mx-auto block"
                crossOrigin="anonymous"
              />
            )}
            {lightboxItem.caption && (
              <p className="text-sm text-white/65 text-center leading-relaxed">
                {lightboxItem.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 設定ダイアログ */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-sans text-base font-medium">
              アルバム設定
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              アルバムのタイトルとカバー写真を変更できます。
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                タイトル
              </label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="アルバム名"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                カバー写真
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COVER_OPTIONS.map((cover) => {
                  const isSelected = editCover === cover.url;
                  return (
                    <button
                      key={cover.id}
                      onClick={() => setEditCover(cover.url)}
                      className={cn(
                        'relative aspect-square rounded-lg overflow-hidden transition-all focus:outline-none',
                        isSelected
                          ? cn('ring-2 ring-offset-1', accentConfig.ring)
                          : 'opacity-60 hover:opacity-100'
                      )}
                      aria-pressed={isSelected}
                      aria-label={`カバーを選ぶ: ${cover.alt}`}
                    >
                      <img
                        src={cover.url}
                        alt={cover.alt}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Check
                            size={14}
                            className="text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              size="sm"
              className={cn(
                'text-white',
                accentConfig.bg,
                accentConfig.bgHover
              )}
              onClick={handleSaveSettings}
            >
              保存する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
