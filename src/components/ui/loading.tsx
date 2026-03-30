import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

interface LoadingProps {
  message?: string;
  className?: string;
}

function Loading({ message = '読み込み中...', className }: LoadingProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background flex items-center justify-center',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8 text-muted-foreground" />
        {message && (
          <p className="text-sm text-muted-foreground font-sans">{message}</p>
        )}
      </div>
    </div>
  );
}

export { Loading };
