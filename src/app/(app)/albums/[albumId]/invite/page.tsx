'use client';

import { use } from 'react';
import { AlbumInvite } from '@/components/album/album-invite';

interface InvitePageProps {
  params: Promise<{ albumId: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { albumId } = use(params);

  return <AlbumInvite albumId={albumId} />;
}
