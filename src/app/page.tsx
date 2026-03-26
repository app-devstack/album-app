'use client';

import { AlbumDetail } from '@/components/album-detail';
import { AlbumGrid } from '@/components/album-grid';
import { CreateAlbumDialog } from '@/components/create-album-dialog';
import { Header } from '@/components/header';
import { Album } from '@/db/schema';
import {
  useAlbums,
  useCreateAlbum,
  useDeleteAlbum,
  useUpdateAlbum,
} from '@/hooks/fetchers/use-albums';
import { type AccentColor } from '@/lib/data';
import { useState } from 'react';

type View = { type: 'grid' } | { type: 'detail'; albumId: string };

export default function Home() {
  const [accent, setAccent] = useState<AccentColor>('blue');
  const { data: albums, isLoading, isError } = useAlbums();
  const { mutateAsync: createAlbumMutation } = useCreateAlbum();
  const { mutateAsync: updateAlbumMutation } = useUpdateAlbum();
  const { mutateAsync: deleteAlbumMutation } = useDeleteAlbum();
  const [view, setView] = useState<View>({ type: 'grid' });
  const [createOpen, setCreateOpen] = useState(false);

  const handleAlbumClick = (album: Album) => {
    setView({ type: 'detail', albumId: album.id });
  };

  const handleBack = () => {
    setView({ type: 'grid' });
  };

  const handleAlbumUpdate = async (
    updated: Partial<Album> & { id: string }
  ) => {
    await updateAlbumMutation(updated);
  };

  const activeAlbum =
    view.type === 'detail' && albums
      ? (albums.find((a) => a.id === view.albumId) ?? null)
      : null;

  if (isLoading) return <div>Loading albums...</div>;
  if (isError) return <div>Error loading albums.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header accent={accent} onAccentChange={setAccent} />

      <div
        className="transition-opacity duration-300"
        key={
          view.type === 'grid'
            ? 'grid'
            : `detail-${view.type === 'detail' ? view.albumId : ''}`
        }
      >
        {view.type === 'grid' && (
          <AlbumGrid
            albums={albums || []}
            accent={accent}
            onAlbumClick={handleAlbumClick}
            onCreateClick={() => setCreateOpen(true)}
          />
        )}

        {view.type === 'detail' && activeAlbum && (
          <AlbumDetail
            album={activeAlbum}
            accent={accent}
            onBack={handleBack}
            onAlbumUpdate={handleAlbumUpdate}
            onAlbumDelete={async (id: string) => {
              await deleteAlbumMutation(id);
            }}
          />
        )}
      </div>

      <CreateAlbumDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accent={accent}
      />
    </div>
  );
}
