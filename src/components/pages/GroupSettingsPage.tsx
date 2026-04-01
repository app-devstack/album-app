'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGroup,
  useGroupMembers,
  useUpdateGroup,
  useUpdateMemberRole,
} from '@/hooks/fetchers/use-groups';
import { groupRoleLabelJa, isGroupAdmin } from '@/lib/group-role';
import { ArrowLeft, Pencil, UserPlus, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// -------------------------------------------------------------------
// GroupSettingsPage
// -------------------------------------------------------------------

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
  if (role === 'owner') return 'default';
  if (role === 'editor') return 'secondary';
  return 'outline';
}

export default function GroupSettingsPage({ groupId }: { groupId: string }) {
  const router = useRouter();
  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId);
  const { mutateAsync: updateGroup } = useUpdateGroup();
  const { mutateAsync: updateMemberRole, isPending: roleUpdating } =
    useUpdateMemberRole();

  const [editOpen, setEditOpen] = useState(false);

  const canManageGroup = isGroupAdmin(group?.role);

  const handleSaveName = async (name: string) => {
    await updateGroup({ groupId, name });
  };

  const handleRoleChange = async (
    userId: string,
    role: 'member' | 'editor'
  ) => {
    await updateMemberRole({ groupId, userId, role });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-8">
        {/* ヘッダー */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 shrink-0 rounded-full"
              aria-label="前の画面に戻る"
            >
              <ArrowLeft size={16} />
            </Button>

            <div className="flex-1 min-w-0 flex items-center gap-2 group">
              <h1 className="font-sans text-xl font-medium text-foreground truncate tracking-wide">
                グループ設定
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pl-11">
            <Button
              variant="outline"
              size="sm"
              className="font-sans gap-1.5"
              asChild
            >
              <Link href="/">
                <UserRound className="size-3.5 opacity-70" />
                グループを切り替え
              </Link>
            </Button>
            {canManageGroup && (
              <Button
                variant="outline"
                size="sm"
                className="font-sans gap-1.5"
                asChild
              >
                <Link href={`/groups/${groupId}/invite`}>
                  <UserPlus className="size-3.5 opacity-70" />
                  グループに招待
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* グループ情報セクション */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            グループ情報
          </h2>
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  グループ名
                </span>
                {groupLoading ? (
                  <Skeleton className="h-5 w-36" />
                ) : (
                  <span className="text-sm font-medium">{group?.name}</span>
                )}
              </div>
              {canManageGroup && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground"
                  onClick={() => setEditOpen(true)}
                  aria-label="グループ名を編集"
                >
                  <Pencil size={14} />
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* メンバーセクション */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            メンバー
            {members && (
              <span className="ml-1.5 normal-case font-normal">
                ({members.length}人)
              </span>
            )}
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {membersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))
            ) : members && members.length > 0 ? (
              members.map((member) => {
                const initial = member.name?.charAt(0)?.toUpperCase() ?? '?';
                const showRoleSelect =
                  canManageGroup && member.role !== 'owner';

                return (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage
                        src={member.image ?? undefined}
                        alt={member.name}
                      />
                      <AvatarFallback className="text-xs">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {member.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </span>
                    </div>
                    {showRoleSelect ? (
                      <Select
                        value={
                          member.role === 'editor' || member.role === 'member'
                            ? member.role
                            : 'member'
                        }
                        onValueChange={(v) => {
                          if (v === 'member' || v === 'editor') {
                            void handleRoleChange(member.userId, v);
                          }
                        }}
                        disabled={roleUpdating}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-[7.5rem] shrink-0"
                          aria-label={`${member.name}の権限`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">メンバー</SelectItem>
                          <SelectItem value="editor">編集者</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={roleBadgeVariant(member.role)}
                        className="shrink-0 text-xs"
                      >
                        {groupRoleLabelJa(member.role)}
                      </Badge>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                メンバーがいません
              </p>
            )}
          </div>
        </section>
      </div>

      {/* グループ名編集ダイアログ */}
      {group && (
        <EditGroupNameDialog
          open={editOpen}
          currentName={group.name}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveName}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// EditGroupNameDialog
// -------------------------------------------------------------------

interface EditGroupNameDialogProps {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

function EditGroupNameDialog({
  open,
  currentName,
  onClose,
  onSave,
}: EditGroupNameDialogProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    setSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>グループ名を編集</DialogTitle>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="グループ名"
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || name.trim() === currentName || saving}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
