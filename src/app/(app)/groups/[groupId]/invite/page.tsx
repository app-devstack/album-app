'use client';

import { GroupInvite } from '@/components/group/group-invite';
import { use } from 'react';

interface InvitePageProps {
  params: Promise<{ groupId: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { groupId } = use(params);

  return <GroupInvite groupId={groupId} />;
}
