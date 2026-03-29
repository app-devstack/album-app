'use client';

import { use } from 'react';
import { AlbumJoin } from '@/components/album/album-join';
import { useAccentStore } from '@/stores/themeStore';

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export default function JoinPage({ params }: JoinPageProps) {
  const { token } = use(params);
  const accent = useAccentStore((state) => state.accent);

  return <AlbumJoin token={token} accent={accent} />;
}
