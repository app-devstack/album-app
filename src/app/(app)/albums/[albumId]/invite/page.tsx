'use client';

import { use } from 'react';
import { AlbumInvite } from '@/components/album/album-invite';
import { useAccentStore } from '@/stores/themeStore';

interface InvitePageProps {
  params: Promise<{ albumId: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { albumId } = use(params);
  const accent = useAccentStore((state) => state.accent);

  return <AlbumInvite albumId={albumId} accent={accent} />;
}
