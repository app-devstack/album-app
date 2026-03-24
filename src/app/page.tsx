'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { AlbumGrid } from '@/components/album-grid';
import { AlbumDetail } from '@/components/album-detail';
import { CreateAlbumDialog } from '@/components/create-album-dialog';
import { MOCK_ALBUMS, type Album, type AccentColor } from '@/lib/data';

type View = { type: 'grid' } | { type: 'detail'; albumId: string };

export default function Home() {
  const [accent, setAccent] = useState<AccentColor>('blue');
  const [albums, setAlbums] = useState<Album[]>(MOCK_ALBUMS);
  const [view, setView] = useState<View>({ type: 'grid' });
  const [createOpen, setCreateOpen] = useState(false);

  const handleAlbumClick = (album: Album) => {
    setView({ type: 'detail', albumId: album.id });
  };

  const handleBack = () => {
    setView({ type: 'grid' });
  };

  const handleAlbumCreate = (newAlbum: Album) => {
    setAlbums((prev) => [newAlbum, ...prev]);
  };

  const handleAlbumUpdate = (updated: Album) => {
    setAlbums((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const activeAlbum =
    view.type === 'detail'
      ? (albums.find((a) => a.id === view.albumId) ?? null)
      : null;

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
            albums={albums}
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
          />
        )}
      </div>

      <CreateAlbumDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accent={accent}
        onAlbumCreate={handleAlbumCreate}
      />
    </div>
  );
}
