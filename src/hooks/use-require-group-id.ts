'use client';

import { useGroupContext } from '@/contexts/GroupContext';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** グループ ID の取得を待つ上限時間（ミリ秒）。 */
const GROUP_ID_WAIT_TIMEOUT_MS = 3_000;

/**
 * グループ ID が無い間は待機し、タイムアウトしたらグループ選択へ誘導する。
 * @returns 現在のグループ ID（未取得時は空文字）
 */
export function useRequireGroupId() {
  const router = useRouter();
  const { currentGroupId } = useGroupContext();

  useEffect(() => {
    if (currentGroupId) return;

    const timer = window.setTimeout(() => {
      toast({
        title: 'グループが選択されていません',
        description: 'アルバムを表示するグループを選んでください',
      });
      router.replace('/?enableGroupSelect=true');
    }, GROUP_ID_WAIT_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [currentGroupId, router]);

  return currentGroupId;
}
