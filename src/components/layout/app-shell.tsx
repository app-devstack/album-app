'use client';

import { Header } from '@/components/layout/header';
import { useSession } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// セッション取得がタイムアウトした場合にローディングを抜けるまでの時間 (ms)
const SESSION_TIMEOUT_MS = 3000;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // 一定時間後にタイムアウトフラグを立てて読み込み中から抜ける
  useEffect(() => {
    if (!isPending) return;
    const timer = setTimeout(() => setTimedOut(true), SESSION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isPending]);

  // セッションが確定してなければ /login へ
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
    if (timedOut && !session) {
      router.replace('/login');
    }
  }, [isPending, session, timedOut, router]);

  const isLoading = isPending && !timedOut;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-sm text-muted-foreground font-sans animate-pulse">
          読み込み中...
        </span>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} />
      {children}
    </div>
  );
}
