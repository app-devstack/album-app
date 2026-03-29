'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlbumJoin } from '@/components/album/album-join';
import { AlbumJoinExpired } from '@/components/album/album-join-expired';
import { AlbumJoinNotFound } from '@/components/album/album-join-not-found';
import { useAccentStore } from '@/stores/themeStore';

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export default function JoinPage({ params }: JoinPageProps) {
  const { token } = use(params);
  const accent = useAccentStore((state) => state.accent);
  const searchParams = useSearchParams();

  // ?status=expired  →  expired screen
  // ?status=notfound →  not-found screen
  // (default)        →  normal join screen
  const status = searchParams.get('status');

  if (status === 'expired') {
    return <AlbumJoinExpired accent={accent} />;
  }

  if (status === 'notfound') {
    return <AlbumJoinNotFound accent={accent} token={token} />;
  }

  return <AlbumJoin token={token} accent={accent} />;
}
