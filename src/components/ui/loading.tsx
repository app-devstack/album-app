import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

type LoadingVariant = 'page' | 'section';

interface LoadingProps {
  message?: string;
  className?: string;
  /** page: 画面全体（デフォルト） / section: ページ内のブロック */
  variant?: LoadingVariant;
  /** Spinner とメッセージの色（ログイン系画面などで上書き） */
  foregroundClassName?: string;
}

/**
 * スピナーとメッセージでデータ取得中などを示す共通 UI。
 * ラッパーにライブリージョンを付与し、スピナーは装飾として隠して読み上げは文言に一本化する。
 */
function Loading({
  message = '読み込み中...',
  className,
  variant = 'page',
  foregroundClassName = 'text-muted-foreground',
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        variant === 'page' && 'min-h-screen bg-background',
        variant === 'section' && 'w-full py-12',
        className
      )}
    >
      <Spinner
        aria-hidden
        className={cn('size-8', foregroundClassName)}
      />
      {message ? (
        <p className={cn('text-sm font-sans', foregroundClassName)}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

export { Loading };
export type { LoadingProps, LoadingVariant };
