'use client';

import { ACCENT_COLORS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SettingsSubpageShellProps = {
  title: string;
  children: React.ReactNode;
};

export function SettingsSubpageShell({
  title,
  children,
}: SettingsSubpageShellProps) {
  const accent = useAccentStore((s) => s.accent);
  const accentConfig =
    ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        <Link
          href="/settings"
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium font-sans w-fit',
            accentConfig.text,
            'hover:opacity-80 transition-opacity'
          )}
        >
          <ArrowLeft size={16} aria-hidden />
          設定に戻る
        </Link>
        <h1 className="font-sans text-lg font-medium tracking-wide text-foreground text-balance">
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}
