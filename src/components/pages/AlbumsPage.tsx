'use client';

import { AlbumGrid } from '@/components/album/album-grid';
import { CreateAlbumDialog } from '@/components/album/create-album-dialog';
import { useGroupContext } from '@/contexts/GroupContext';
import { type Album } from '@/db/schema';
import { useAlbums } from '@/hooks/fetchers/use-albums';
import { useAccentStore } from '@/stores/themeStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AlbumsPage() {
  const router = useRouter();
  const accent = useAccentStore((state) => state.accent);
  const { currentGroupId } = useGroupContext();
  const { data: albums, isLoading, isError } = useAlbums(currentGroupId);
  const [createOpen, setCreateOpen] = useState(false);

  const handleAlbumClick = (album: Album) => {
    router.push(`/albums/${album.id}`);
  };

  if (isLoading) return <div>Loading albums...</div>;
  if (isError) return <div>Error loading albums.</div>;

  return (
    <div className="min-h-screen bg-background">
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
