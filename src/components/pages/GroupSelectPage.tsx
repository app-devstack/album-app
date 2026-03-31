'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGroupContext } from '@/contexts/GroupContext';
import { useCreateGroup, useGroups } from '@/hooks/fetchers/use-groups';
import { Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GroupSelectPage() {
  const router = useRouter();
  const { data: groups, isLoading } = useGroups();
  const { mutateAsync: createGroup } = useCreateGroup();
  const { setCurrentGroupId } = useGroupContext();

  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSelectGroup = (groupId: string) => {
    setCurrentGroupId(groupId);
    router.push('/albums');
  };

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const group = await createGroup(name);
      setNewGroupName('');
      handleSelectGroup(group.id);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            グループを選択
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            アルバムを表示するグループを選んでください
          </p>
        </div>

        {/* グループ一覧 */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              読み込み中...
            </p>
          ) : groups && groups.length > 0 ? (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleSelectGroup(group.id)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.role}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              参加しているグループがありません
            </p>
          )}
        </div>

        {/* 区切り */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">または新規作成</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* グループ作成 */}
        <div className="flex flex-col gap-2">
          <Input
            placeholder="グループ名を入力"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
          />
          <Button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || creating}
            className="gap-2"
          >
            <Plus size={15} />
            グループを作成
          </Button>
        </div>

        {/* 招待リンクで参加 */}
        <p className="text-xs text-muted-foreground text-center">
          招待リンクをお持ちの場合は、リンクを開いて参加できます。
        </p>
      </div>
    </div>
  );
}
