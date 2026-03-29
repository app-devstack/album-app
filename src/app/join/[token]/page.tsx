'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlbumJoin } from '@/components/album/album-join';
import { AlbumJoinExpired } from '@/components/album/album-join-expired';
import { AlbumJoinNotFound } from '@/components/album/album-join-not-found';

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export default function JoinPage({ params }: JoinPageProps) {
  const { token } = use(params);
  const searchParams = useSearchParams();

  const status = searchParams.get('status');

  if (status === 'expired') {
    return <AlbumJoinExpired />;
  }

  if (status === 'notfound') {
    return <AlbumJoinNotFound token={token} />;
  }

  return <AlbumJoin token={token} />;
}
