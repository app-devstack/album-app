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

function Loading({
  message = '読み込み中...',
  className,
  variant = 'page',
  foregroundClassName = 'text-muted-foreground',
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        variant === 'page' && 'min-h-screen bg-background',
        variant === 'section' && 'w-full py-12',
        className
      )}
    >
      <Spinner className={cn('size-8', foregroundClassName)} />
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
