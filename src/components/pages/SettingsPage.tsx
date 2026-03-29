'use client';

import { AppIcon } from '@/components/layout/app-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { signOut } from '@/lib/auth/auth-client';
import { ACCENT_COLORS } from '@/lib/data';
import {
  MOCK_GROUPS,
  type SettingsAccount,
  type SettingsGroup,
} from '@/lib/settings-data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';
import {
  ChevronRight,
  Crown,
  LogOut,
  Mail,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============================================================
// サブコンポーネント
// ============================================================

interface SectionHeaderProps {
  label: string;
}
function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <p className="px-1 mb-1 text-xs font-medium font-sans text-muted-foreground tracking-wider uppercase select-none">
      {label}
    </p>
  );
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  accentText?: string;
  destructive?: boolean;
  trailing?: React.ReactNode;
}
function Row({
  icon,
  label,
  description,
  href,
  onClick,
  destructive,
  trailing,
}: RowProps) {
  const base = cn(
    'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors duration-150',
    'bg-card border border-border',
    destructive
      ? 'hover:bg-destructive/5 active:scale-[0.99]'
      : 'hover:bg-muted active:scale-[0.99]',
    (href || onClick) && 'cursor-pointer'
  );

  const inner = (
    <>
      <span
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
          destructive ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
        )}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium font-sans leading-tight',
            destructive ? 'text-destructive' : 'text-foreground'
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground font-sans mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
      {trailing ?? (
        !destructive && (
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        )
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={cn(base, 'w-full text-left')} onClick={onClick}>
      {inner}
    </button>
  );
}

// ============================================================
// グループカード
// ============================================================

interface GroupRowProps {
  group: SettingsGroup;
  accentConfig: ReturnType<typeof ACCENT_COLORS.find>;
}
function GroupRow({ group, accentConfig }: GroupRowProps) {
  const initials = group.name.charAt(0);
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card border border-border">
      {/* カバー or イニシャル */}
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
        {group.coverUrl ? (
          <img
            src={group.coverUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium font-sans">
            {initials}
          </div>
        )}
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium font-sans text-foreground leading-tight text-pretty">
          {group.name}
        </p>
        <p className="text-xs text-muted-foreground font-sans mt-0.5">
          {group.memberCount}人のメンバー
        </p>
      </div>

      {/* ロールバッジ */}
      {group.role === 'owner' ? (
        <span
          className={cn(
            'flex items-center gap-1 text-[10px] font-medium font-sans px-2 py-0.5 rounded-full shrink-0',
            accentConfig
              ? cn(accentConfig.bgLight, accentConfig.text)
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Crown size={9} />
          オーナー
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-medium font-sans px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
          <Users size={9} />
          メンバー
        </span>
      )}
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

interface SettingsPageProps {
  account: SettingsAccount;
  groups?: SettingsGroup[];
}

export function SettingsPageContent({
  account,
  groups = MOCK_GROUPS,
}: SettingsPageProps) {
  const router = useRouter();
  const accent = useAccentStore((state) => state.accent);
  const accentConfig = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

  const initial = account.name?.charAt(0)?.toUpperCase() ?? '?';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">

        {/* ── ページタイトル ── */}
        <div className="flex items-center gap-2.5">
          <AppIcon size={22} className={accentConfig.text} />
          <h1 className="font-sans text-lg font-medium tracking-wide text-foreground text-balance">
            設定
          </h1>
        </div>

        {/* ── アカウント情報 ── */}
        <section aria-labelledby="section-account">
          <SectionHeader label="アカウント" />
          <div
            className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-4"
            id="section-account"
          >
            <Avatar className="h-12 w-12 shrink-0">
              {account.image && (
                <AvatarImage src={account.image} alt={account.name} />
              )}
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium font-sans">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium font-sans text-foreground leading-tight text-pretty truncate">
                {account.name}
              </p>
              <p className="text-xs text-muted-foreground font-sans mt-0.5 truncate">
                {account.email}
              </p>
            </div>
            <Link
              href="/settings/account"
              className={cn(
                'text-xs font-medium font-sans px-3 py-1.5 rounded-lg transition-colors duration-150',
                accentConfig.bgLight,
                accentConfig.text,
                'hover:opacity-80 active:scale-[0.97]'
              )}
            >
              編集
            </Link>
          </div>
        </section>

        {/* ── グループ ── */}
        <section aria-labelledby="section-groups-label">
          <SectionHeader label="グループ" />
          <div className="flex flex-col gap-2" id="section-groups-label">
            {groups.map((group) => (
              <GroupRow key={group.id} group={group} accentConfig={accentConfig} />
            ))}

            <Separator className="my-1" />

            {/* メンバーを招待 */}
            <Row
              icon={<Mail size={16} />}
              label="メンバーを招待"
              description="招待リンクを発行してグループに追加"
              href="/settings/invite"
            />

            {/* グループ管理 */}
            <Row
              icon={<Shield size={16} />}
              label="グループを管理"
              description="メンバーの権限・グループ設定"
              href="/settings/groups"
            />
          </div>
        </section>

        {/* ── アカウント操作 ── */}
        <section aria-labelledby="section-actions-label">
          <SectionHeader label="アカウント操作" />
          <div className="flex flex-col gap-2">
            <Row
              icon={<LogOut size={16} />}
              label="ログアウト"
              description={account.email}
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
