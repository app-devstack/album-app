'use client';

import { AlbumDetail } from '@/components/album-detail/album-detail';
import { useGroupContext } from '@/contexts/GroupContext';
import { type Album } from '@/db/schema';
import {
  useAlbum,
  useDeleteAlbum,
  useUpdateAlbum,
} from '@/hooks/fetchers/use-albums';
import { useAccentStore } from '@/stores/themeStore';
import { useRouter } from 'next/navigation';

type AlbumDetailPageProps = {
  albumId: string;
};

export default function AlbumDetailPage({ albumId }: AlbumDetailPageProps) {
  const router = useRouter();
  const accent = useAccentStore((state) => state.accent);
  const { currentGroupId } = useGroupContext();
  const { data: album, isPending, isError, error } = useAlbum(albumId);
  const { mutateAsync: updateAlbumMutation } = useUpdateAlbum(currentGroupId);
  const { mutateAsync: deleteAlbumMutation } = useDeleteAlbum(currentGroupId);

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

  if (isPending) return <div>Loading album...</div>;
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
