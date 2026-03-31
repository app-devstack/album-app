'use client';

import SettingsAccountInfo from '@/components/settings/settings-account-info';
import { SettingsRow } from '@/components/settings/settings-row';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { Loading } from '@/components/ui/loading';
import { useGroupContext } from '@/contexts/GroupContext';
import { useGroups } from '@/hooks/fetchers/use-groups';
import { signOut, useSession } from '@/lib/auth/auth-client';
import { LogOut, Mail, Shield, UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SettingsPage() {
  const { data, isPending } = useSession();
  const account = data?.user ?? null;

  const { data: groups = [] } = useGroups();
  const router = useRouter();
  const { currentGroupId } = useGroupContext();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // session取得中はローディング表示
  if (isPending) return <Loading />;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">
        {/* ── ページタイトル ── */}
        <div className="flex items-center gap-2.5">
          <h1 className="font-sans text-lg font-medium tracking-wide text-foreground text-balance">
            設定
          </h1>
        </div>

        {/* ── アカウント情報 ── */}
        <SettingsAccountInfo account={account} />

        {/* ── グループ ── */}
        <section aria-labelledby="section-groups-label">
          <SettingsSectionHeader label="グループ" />
          <div className="flex flex-col gap-2" id="section-groups-label">
            {/* グループの切り替え */}
            <SettingsRow
              icon={<UsersIcon size={16} />}
              label="グループを切り替え"
              description={
                groups.length > 0
                  ? '所属しているグループを切り替える'
                  : '現在所属しているグループはありません'
              }
              href="/"
              disabled={groups.length === 0}
            />

            {/* メンバーを招待 */}
            <SettingsRow
              icon={<Mail size={16} />}
              label="グループに招待"
              description="招待リンクを発行してメンバーを追加"
              href={`/groups/${currentGroupId}/invite`}
            />

            {/* グループ管理 */}
            <SettingsRow
              icon={<Shield size={16} />}
              label="グループを管理"
              description="メンバーの権限・グループ設定"
              href={`/groups/${currentGroupId}/setting`}
            />
          </div>
        </section>

        {/* ── アカウント操作 ── */}
        <section aria-labelledby="section-actions-label">
          <SettingsSectionHeader label="アカウント操作" />
          <div className="flex flex-col gap-2">
            <SettingsRow
              icon={<LogOut size={16} />}
              label="ログアウト"
              description={account?.email}
              destructive
              onClick={handleSignOut}
              trailing={null}
            />
          </div>
        </section>

        {/* フッター */}
        <footer className="text-center text-[11px] text-muted-foreground font-sans tracking-wider select-none pt-2">
          &copy; 2026 思い出帳
        </footer>
      </div>
    </main>
  );
}
