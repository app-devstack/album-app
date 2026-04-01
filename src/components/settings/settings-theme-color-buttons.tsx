'use client';

import {
  ACCENT_COLORS,
  type AccentColor,
  type AccentColorConfig,
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';
import { Check } from 'lucide-react';

export function SettingsThemeColorButtons() {
  const accent = useAccentStore((s) => s.accent);
  const setAccent = useAccentStore((s) => s.setAccent);

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="テーマカラー"
    >
      {ACCENT_COLORS.map((color) => (
        <ThemeColorButton
          key={color.id}
          color={color}
          selected={accent === color.id}
          onSelect={() => setAccent(color.id)}
        />
      ))}
    </div>
  );
}

function ThemeColorButton({
  color,
  selected,
  onSelect,
}: {
  color: AccentColorConfig;
  selected: boolean;
  onSelect: (id: AccentColor) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(color.id)}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium font-sans transition-colors',
        'bg-card border-border hover:bg-muted',
        selected && ['ring-2 ring-offset-2 ring-offset-background', color.ring]
      )}
    >
      <span
        className={cn('h-3.5 w-3.5 rounded-full shrink-0', color.dot)}
        aria-hidden
      />
      <span className="text-foreground">{color.label}</span>
      {selected && <Check size={14} className={cn('shrink-0', color.text)} />}
    </button>
  );
}
