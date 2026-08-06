'use client';

import { AlbumGrid } from '@/components/album/album-grid';
import { CreateAlbumDialog } from '@/components/album/create-album-dialog';
import { Loading } from '@/components/ui/loading';
import { type Album } from '@/db/schema';
import { useAlbums } from '@/hooks/fetchers/use-albums';
import { useRequireGroupId } from '@/hooks/use-require-group-id';
import { useAlbumListStore } from '@/stores/albumListStore';
import { useAccentStore } from '@/stores/themeStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** アルバム一覧ページ。 */
export default function AlbumsPage() {
  const router = useRouter();
  const accent = useAccentStore((state) => state.accent);
  const currentGroupId = useRequireGroupId();
  const sortOrder = useAlbumListStore((s) => s.sortOrder);
  const {
    data: albums,
    isLoading,
    isError,
  } = useAlbums(currentGroupId, sortOrder);
  const [createOpen, setCreateOpen] = useState(false);

  const handleAlbumClick = (album: Album) => {
    router.push(`/albums/${album.id}`);
  };

  if (!currentGroupId || isLoading) {
    return (
      <Loading
        message="アルバムを読み込み中..."
        foregroundClassName="text-primary"
      />
    );
  }
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
