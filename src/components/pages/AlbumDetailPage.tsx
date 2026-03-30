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
import { useParams, useRouter } from 'next/navigation';

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.albumId as string;

  const accent = useAccentStore((state) => state.accent);
  const { currentGroupId } = useGroupContext();
  const { data: album, isLoading, isError } = useAlbum(albumId);
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

  if (isLoading) return <div>Loading album...</div>;
  if (isError) return <div>Error .</div>;
  // if (!album) return <div>Error album.</div>;

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
