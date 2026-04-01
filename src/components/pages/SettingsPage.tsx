'use client';

import SettingsAccountInfo from '@/components/settings/settings-account-info';
import { SettingsRow } from '@/components/settings/settings-row';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { SettingsThemeColorButtons } from '@/components/settings/settings-theme-color-buttons';
import { Loading } from '@/components/ui/loading';
import { signOut, useSession } from '@/lib/auth/auth-client';
import { Bell, FileText, LogOut, Palette, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SettingsPage() {
  const { data, isPending } = useSession();
  const account = data?.user ?? null;
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

        <SettingsAccountInfo account={account} />

        <section aria-labelledby="section-appearance-label">
          <SettingsSectionHeader label="表示" />
          <div className="flex flex-col gap-3" id="section-appearance-label">
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-card border border-border">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-muted text-muted-foreground">
                <Palette size={16} aria-hidden />
              </span>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <p className="text-sm font-medium font-sans text-foreground">
                    テーマカラー
                  </p>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">
                    ボタンやアクセントの色を選べます
                  </p>
                </div>
                <SettingsThemeColorButtons />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="section-info-label">
          <SettingsSectionHeader label="アプリ情報" />
          <div className="flex flex-col gap-2" id="section-info-label">
            <SettingsRow
              icon={<Shield size={16} />}
              label="プライバシーポリシー"
              description="個人情報の取り扱いについて"
              href="/settings/privacy"
            />
            <SettingsRow
              icon={<FileText size={16} />}
              label="利用規約"
              description="サービス利用にあたっての条件"
              href="/settings/terms"
            />
            <SettingsRow
              icon={<Bell size={16} />}
              label="アプリからのお知らせ"
              description="リリースやメンテナンスなどのお知らせ"
              href="/settings/announcements"
            />
          </div>
        </section>

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

        <footer className="text-center text-[11px] text-muted-foreground font-sans tracking-wider select-none pt-2">
          &copy; 2026 思い出帳
        </footer>
      </div>
    </main>
  );
}
