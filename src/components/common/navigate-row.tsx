import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

/**
 * {@link NavigateRow} に渡すプロパティ。
 */
interface NavigateRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  accentText?: string;
  destructive?: boolean;
  trailing?: React.ReactNode;
  disabled?: boolean;
}

/**
 * ナビゲーション用
 */
export function NavigateRow({
  icon,
  label,
  description,
  href,
  onClick,
  destructive,
  trailing,
  disabled,
}: NavigateRowProps) {
  const base = cn(
    'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors duration-150',
    'bg-card border border-border',
    disabled
      ? 'opacity-40 cursor-not-allowed pointer-events-none'
      : destructive
        ? 'hover:bg-destructive/5 active:scale-[0.99]'
        : 'hover:bg-muted active:scale-[0.99]',
    !disabled && (href || onClick) && 'cursor-pointer'
  );

  const inner = (
    <>
      <span
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
          destructive
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted text-muted-foreground'
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
      {trailing ??
        (!destructive && (
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        ))}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={base}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn(base, 'w-full text-left')}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {inner}
    </button>
  );
}
