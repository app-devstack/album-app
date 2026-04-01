'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ACCENT_COLORS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';
import { Check, Palette } from 'lucide-react';

/** 設定画面用。セル全体をタップで開き、ヘッダーと同様のドロップダウンでアクセントを選ぶ。 */
export function SettingsThemeColorSelect() {
  const accent = useAccentStore((s) => s.accent);
  const setAccent = useAccentStore((s) => s.setAccent);
  const current =
    ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

  return (
    <DropdownMenu>
      <div className="rounded-xl border border-border bg-card">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none rounded-xl',
              'transition-colors hover:bg-muted/50',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
            aria-label="テーマカラーを選ぶ"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Palette size={16} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-medium text-foreground">
                テーマカラー
              </p>
              <p className="mt-0.5 font-sans text-xs text-muted-foreground">
                ボタンやアクセントの色を選べます
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-2">
              <span
                className={cn('h-2.5 w-2.5 shrink-0 rounded-full', current.dot)}
                aria-hidden
              />
              <span className="font-sans text-sm text-foreground">
                {current.label}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="py-1.5 text-xs font-normal text-muted-foreground">
          テーマカラー
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACCENT_COLORS.map((color) => (
          <DropdownMenuItem
            key={color.id}
            onSelect={() => setAccent(color.id)}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <span className={cn('h-3 w-3 shrink-0 rounded-full', color.dot)} />
            <span className="text-sm">{color.label}</span>
            {accent === color.id && (
              <Check size={12} className="ml-auto text-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
