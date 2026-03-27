'use client';

import { AlbumDetail } from '@/components/album-detail';
import { Header } from '@/components/header';
import { type Album } from '@/db/schema';
import {
  useAlbum,
  useDeleteAlbum,
  useUpdateAlbum,
} from '@/hooks/fetchers/use-albums';
import { type AccentColor } from '@/lib/data';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.albumId as string;

  const [accent, setAccent] = useState<AccentColor>('blue');
  const { data: album, isLoading, isError } = useAlbum(albumId);
  const { mutateAsync: updateAlbumMutation } = useUpdateAlbum();
  const { mutateAsync: deleteAlbumMutation } = useDeleteAlbum();

  const handleBack = () => {
    router.push('/');
  };

  const handleAlbumUpdate = async (
    updated: Partial<Album> & { id: string }
  ) => {
    await updateAlbumMutation(updated);
  };

  const handleAlbumDelete = async (id: string) => {
    await deleteAlbumMutation(id);
    router.push('/');
  };

  if (isLoading) return <div>Loading album...</div>;
  if (isError) return <div>Error .</div>;
  // if (!album) return <div>Error album.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header accent={accent} onAccentChange={setAccent} />

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
