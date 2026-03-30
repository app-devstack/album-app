import { AccentColorConfig } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Crown, Users } from 'lucide-react';

interface SettingsGroupItem {
  id: string;
  name: string;
  coverUrl?: string | null;
  role: string;
}

interface SettingsGroupRowProps {
  group: SettingsGroupItem;
  accentConfig: AccentColorConfig;
}

export function SettingsGroupRow({
  group,
  accentConfig,
}: SettingsGroupRowProps) {
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
