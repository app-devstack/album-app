import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const inviteKeys = {
  token: (groupId: string) => ['invite-token', groupId] as const,
};

const getInviteToken = async (groupId: string) => {
  const res = await api.groups[':groupId']['invite-token'].$get({
    param: { groupId },
  });
  if (!res.ok) throw new Error('Failed to fetch invite token');
  return res.json();
};

export const useInviteToken = (groupId: string) => {
  return useQuery({
    queryKey: inviteKeys.token(groupId),
    queryFn: () => getInviteToken(groupId),
    enabled: !!groupId,
  });
};
