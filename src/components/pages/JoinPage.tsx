'use client';

import { GroupJoin } from '@/components/group/group-join';
import { GroupJoinExpired } from '@/components/group/group-join-expired';
import { GroupJoinNotFound } from '@/components/group/group-join-not-found';
import { useJoinInfo } from '@/hooks/fetchers/use-join';

interface JoinPageProps {
  token: string;
}

export function JoinPage({ token }: JoinPageProps) {
  const { error } = useJoinInfo(token);

  if (error) {
    const err = error as { status?: number };
    if (err.status === 404) {
      return <GroupJoinNotFound token={token} />;
    }
    if (err.status === 410) {
      return <GroupJoinExpired />;
    }
  }

  return <GroupJoin token={token} />;
}
