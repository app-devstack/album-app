'use client';

import { JoinPage } from '@/components/pages/JoinPage';
import { use } from 'react';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function Page({ params }: PageProps) {
  const { token } = use(params);

  return <JoinPage token={token} />;
}
