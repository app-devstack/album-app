'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';

/** 設定画面用。アクセントカラーをセレクトで選ぶ。 */
export function SettingsThemeColorSelect() {
  const accent = useAccentStore((s) => s.accent);
  const setAccent = useAccentStore((s) => s.setAccent);
  const current =
    ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];

  return (
    <Select value={accent} onValueChange={(v) => setAccent(v as AccentColor)}>
      <SelectTrigger
        size="sm"
        aria-label="テーマカラー"
        className={cn(
          'w-full max-w-xs border-border bg-muted/40 shadow-none',
          'text-muted-foreground hover:text-foreground',
          'data-[size=sm]:h-8 text-xs font-sans'
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={cn('h-2.5 w-2.5 shrink-0 rounded-full', current.dot)}
            aria-hidden
          />
          <SelectValue placeholder="色を選ぶ" />
        </span>
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        className="min-w-[var(--radix-select-trigger-width)]"
      >
        {ACCENT_COLORS.map((color) => (
          <SelectItem
            key={color.id}
            value={color.id}
            className="text-sm font-sans"
          >
            <span
              className={cn('h-3 w-3 shrink-0 rounded-full', color.dot)}
              aria-hidden
            />
            {color.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
