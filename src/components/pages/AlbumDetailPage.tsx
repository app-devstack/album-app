'use client';

import { AlbumDetail } from '@/components/album-detail/album-detail';
import { Loading } from '@/components/ui/loading';
import { useGroupContext } from '@/contexts/GroupContext';
import { type Album } from '@/db/schema';
import {
  useAlbum,
  useDeleteAlbum,
  useUpdateAlbum,
} from '@/hooks/fetchers/use-albums';
import { useAccentStore } from '@/stores/themeStore';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

type AlbumDetailPageProps = {
  albumId: string;
};

/** アルバム詳細ページ（クエリ `photo` とライトボックス履歴を同期）。 */
export default function AlbumDetailPage({ albumId }: AlbumDetailPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accent = useAccentStore((state) => state.accent);
  const { currentGroupId } = useGroupContext();
  const { data: album, isPending, isError, error } = useAlbum(albumId);
  const { mutateAsync: updateAlbumMutation } = useUpdateAlbum(currentGroupId);
  const { mutateAsync: deleteAlbumMutation } = useDeleteAlbum(currentGroupId);

  /** グリッドから開いたときのみ true。URL から `photo` が消えたらリセット。 */
  const lightboxOpenedViaPushRef = useRef(false);

  const photoIdFromUrl = searchParams.get('photo');

  useEffect(() => {
    if (!searchParams.get('photo')) {
      lightboxOpenedViaPushRef.current = false;
    }
  }, [searchParams]);

  const openLightbox = useCallback(
    (photoId: string) => {
      lightboxOpenedViaPushRef.current = true;
      const q = new URLSearchParams(searchParams.toString());
      q.set('photo', photoId);
      router.push(`${pathname}?${q}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const closeLightbox = useCallback(() => {
    const photo = searchParams.get('photo');
    if (!photo) return;
    if (lightboxOpenedViaPushRef.current) {
      router.back();
    } else {
      const q = new URLSearchParams(searchParams.toString());
      q.delete('photo');
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const stripInvalidPhotoQuery = useCallback(() => {
    const photo = searchParams.get('photo');
    if (!photo) return;
    const q = new URLSearchParams(searchParams.toString());
    q.delete('photo');
    const s = q.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleBack = () => {
    router.push('/albums');
  };

  const handleAlbumUpdate = async (
    updated: Partial<Album> & { id: string }
  ) => {
    await updateAlbumMutation(updated);
  };

  const handleAlbumDelete = async (id: string) => {
    await deleteAlbumMutation(id);
    router.push('/albums');
  };

  if (isPending) return <Loading message="アルバムを読み込み中..." />;
  if (isError) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>アルバムの読み込みに失敗しました。</p>
        {error?.message ? (
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {album ? (
        <AlbumDetail
          album={album}
          accent={accent}
          lightboxPhotoId={photoIdFromUrl}
          onOpenLightbox={openLightbox}
          onCloseLightbox={closeLightbox}
          onStripInvalidPhotoQuery={stripInvalidPhotoQuery}
          onBack={handleBack}
          onAlbumUpdate={handleAlbumUpdate}
          onAlbumDelete={handleAlbumDelete}
        />
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p>Album not found.</p>
        </div>
      )}
    </div>
  );
}
