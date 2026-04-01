import { api } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';

export const joinKeys = {
  info: (token: string) => ['join', token] as const,
};

type GroupJoinInfo = {
  groupId: string;
  name: string;
  coverUrl: string;
  inviter: { name: string; image: string | null };
  createdAt: string;
  photoCount: number;
  albumCount: number;
  memberCount: number;
};

const getJoinInfo = async (token: string): Promise<GroupJoinInfo> => {
  const res = await api.join[':token'].$get({ param: { token } });
  if (res.status === 404 || res.status === 410) {
    const body = (await res.json()) as { error: string };
    throw { status: res.status, error: body.error };
  }
  if (!res.ok) throw new Error('Failed to fetch join info');
  return res.json() as Promise<GroupJoinInfo>;
};

const postJoin = async ({ token }: { token: string }) => {
  // userIdはサーバー側でsessionから取得するためbodyから削除
  const res = await api.join[':token'].$post({
    param: { token },
  });
  if (!res.ok) throw new Error('Failed to join group');
  return res.json() as Promise<{ groupId: string; alreadyMember?: boolean }>;
};

export const useJoinInfo = (token: string) => {
  return useQuery({
    queryKey: joinKeys.info(token),
    queryFn: () => getJoinInfo(token),
    retry: false,
    enabled: !!token,
  });
};

export const useJoinGroup = () => {
  return useMutation({
    mutationFn: postJoin,
  });
};
