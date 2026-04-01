'use client';

import { NavigateRow } from '@/components/common/navigate-row';
import SettingsAccountInfo from '@/components/settings/settings-account-info';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { SettingsThemeColorSelect } from '@/components/settings/settings-theme-color-select';
import { Loading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { useGroupContext } from '@/contexts/GroupContext';
import { signOut, useSession } from '@/lib/auth/auth-client';
import { Bell, FileText, LogOut, Shield, UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SettingsPage() {
  const { data, isPending } = useSession();
  const account = data?.user ?? null;

  const { currentGroupId } = useGroupContext();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (isPending) return <Loading />;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="flex items-center gap-2.5">
          <h1 className="font-sans text-lg font-medium tracking-wide text-foreground text-balance">
            設定
          </h1>
        </div>

        <section aria-labelledby="section-account">
          <SettingsSectionHeader label="アカウント" />

          <div className="flex flex-col gap-2">
            <SettingsAccountInfo account={account} />
            <NavigateRow
              icon={<LogOut size={16} />}
              label="ログアウト"
              description={account?.email}
              destructive
              onClick={handleSignOut}
              trailing={null}
            />
          </div>
        </section>

        <section aria-labelledby="section-groups-label">
          <SettingsSectionHeader label="グループ" />
          <NavigateRow
            icon={<UsersIcon size={16} />}
            label="グループ設定"
            description="グループの管理やグループの切り替え"
            href={`/groups/${currentGroupId}/setting?from=settings`}
          />
        </section>

        <Separator />

        <section aria-labelledby="section-appearance-label">
          <SettingsSectionHeader label="表示" />
          <div className="flex flex-col gap-3" id="section-appearance-label">
            <SettingsThemeColorSelect />
          </div>
        </section>

        <section aria-labelledby="section-info-label">
          <SettingsSectionHeader label="アプリ情報" />
          <div className="flex flex-col gap-2" id="section-info-label">
            <NavigateRow
              icon={<Shield size={16} />}
              label="プライバシーポリシー"
              description="個人情報の取り扱いについて"
              href="/settings/privacy"
            />
            <NavigateRow
              icon={<FileText size={16} />}
              label="利用規約"
              description="サービス利用にあたっての条件"
              href="/settings/terms"
            />
            <NavigateRow
              icon={<Bell size={16} />}
              label="アプリからのお知らせ"
              description="リリースやメンテナンスなどのお知らせ"
              href="/settings/announcements"
            />
          </div>
        </section>

        <footer className="text-center text-[11px] text-muted-foreground font-sans tracking-wider select-none pt-2">
          &copy; 2026 思い出帳
        </footer>
      </div>
    </main>
  );
}
