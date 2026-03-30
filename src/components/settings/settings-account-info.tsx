'use client';

import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ACCENT_COLORS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';
import Link from 'next/link';

type Account = {
  name: string;
  email: string;
  image?: string | null;
};

type SettingsAccountInfoProps = {
  account: Account | null;
};

export default function SettingsAccountInfo({
  account,
}: SettingsAccountInfoProps) {
  const accent = useAccentStore((state) => state.accent);
  const accentConfig =
    ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

  const initial = account?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <section aria-labelledby="section-account">
      <SettingsSectionHeader label="アカウント" />

      <div
        className="rounded-xl border border-border bg-card px-4 py-4 flex items-center gap-4"
        id="section-account"
      >
        {/* アカウントアイコン */}
        <Avatar className="h-12 w-12 shrink-0">
          {account?.image && (
            <AvatarImage src={account.image} alt={account.name ?? ''} />
          )}
          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium font-sans">
            {initial}
          </AvatarFallback>
        </Avatar>

        {/* アカウント情報 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium font-sans text-foreground leading-tight text-pretty truncate">
            {account?.name}
          </p>
          <p className="text-xs text-muted-foreground font-sans mt-0.5 truncate">
            {account?.email}
          </p>
        </div>

        {/* WIP: アカウント編集遷移ボタン */}
        <Link
          href="/settings/account"
          className={cn(
            'text-xs font-medium font-sans px-3 py-1.5 rounded-lg transition-colors duration-150',
            accentConfig.bgLight,
            accentConfig.text,
            'pointer-events-none opacity-50', // 未実装のため、disabled
            'hover:opacity-80 active:scale-[0.97]'
          )}
        >
          編集
        </Link>
      </div>
    </section>
  );
}
