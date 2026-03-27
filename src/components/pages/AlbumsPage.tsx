'use client';

import { AlbumGrid } from '@/components/album-grid';
import { CreateAlbumDialog } from '@/components/create-album-dialog';
import { Header } from '@/components/header';
import { type Album } from '@/db/schema';
import { useAlbums } from '@/hooks/fetchers/use-albums';
import { type AccentColor } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AlbumsPage() {
  const router = useRouter();
  const [accent, setAccent] = useState<AccentColor>('blue');
  const { data: albums, isLoading, isError } = useAlbums();
  const [createOpen, setCreateOpen] = useState(false);

  const handleAlbumClick = (album: Album) => {
    router.push(`/albums/${album.id}`);
  };

  if (isLoading) return <div>Loading albums...</div>;
  if (isError) return <div>Error loading albums.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header accent={accent} onAccentChange={setAccent} />

      <AlbumGrid
        albums={albums || []}
        accent={accent}
        onAlbumClick={handleAlbumClick}
        onCreateClick={() => setCreateOpen(true)}
      />

      <CreateAlbumDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accent={accent}
      />
    </div>
  );
}
