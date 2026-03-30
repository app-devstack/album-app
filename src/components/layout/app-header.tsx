'use client';

import { AppIcon } from '@/components/layout/app-icon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth/auth-client';
import { ACCENT_COLORS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useAccentStore } from '@/stores/themeStore';
import { Check, LogOut, Palette, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderUser {
  name: string;
  email: string;
  image?: string | null;
}

interface AppHeaderProps {
  user: HeaderUser;
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const accent = useAccentStore((state) => state.accent);
  const onAccentChange = useAccentStore((state) => state.setAccent);
  const currentAccent = ACCENT_COLORS.find((a) => a.id === accent)!;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const initial = user.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* ロゴ */}
        <div className="relative flex items-center gap-2.5">
          <AppIcon size={28} className={currentAccent.text} />
          <span className="font-sans text-base font-medium tracking-wider text-foreground">
            思い出帳
          </span>

          <Link href={'/albums'} className="absolute inset-0 z-10" />
        </div>

        {/* 右側メニュー */}
        <div className="flex items-center gap-2">
          {/* テーマカラー選択 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground px-2.5"
                aria-label="テーマカラーを選ぶ"
              >
                <Palette size={14} className={currentAccent.text} />
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0',
                    currentAccent.dot
                  )}
                />
                <span className="hidden sm:inline text-xs">
                  {currentAccent.label}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal py-1.5">
                テーマカラー
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ACCENT_COLORS.map((color) => (
                <DropdownMenuItem
                  key={color.id}
                  onSelect={() => onAccentChange(color.id)}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <span
                    className={cn('h-3 w-3 rounded-full shrink-0', color.dot)}
                  />
                  <span className="text-sm">{color.label}</span>
                  {accent === color.id && (
                    <Check size={12} className="ml-auto text-foreground" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ユーザーアバター + ログアウト */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-medium text-muted-foreground border border-border select-none hover:bg-accent transition-colors overflow-hidden"
                aria-label="マイアカウント"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-7 w-7 object-cover"
                  />
                ) : (
                  initial
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-normal py-1.5">
                <div className="font-medium text-foreground truncate">
                  {user.name}
                </div>
                <div className="text-muted-foreground truncate">
                  {user.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* WIP:設定は別のところに置く */}
              <DropdownMenuItem
                onSelect={() => router.push('/settings')}
                className="flex items-center gap-2 cursor-pointer text-foreground"
              >
                <Settings size={14} />
                <span>設定</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={handleSignOut}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut size={14} />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
