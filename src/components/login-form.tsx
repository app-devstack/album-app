'use client';

import { AppIcon } from '@/components/app-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 認証処理を実装予定
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Google 認証処理を実装予定
    setTimeout(() => setGoogleLoading(false), 1500);
  };

  return (
    <div className="login-root min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-login-bg">
      {/* 背景の桜花びら装飾 */}
      <PetalDecoration />

      {/* カード */}
      <div className="relative z-10 w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-login-card border border-login-border shadow-sm">
            <AppIcon size={38} className="text-login-accent" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-medium tracking-widest text-login-fg leading-tight">
              思い出帳
            </h1>
            <p className="mt-1 text-xs font-sans text-login-muted tracking-wider">
              大切な記憶を、いつでも一緒に。
            </p>
          </div>
        </div>

        {/* フォームカード */}
        <div className="bg-login-card border border-login-border rounded-2xl shadow-md px-7 py-8 flex flex-col gap-6">
          {/* Google ログイン */}
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full h-11 text-sm font-medium gap-3',
              'border-login-border bg-login-card hover:bg-login-muted-bg',
              'text-login-fg shadow-xs transition-all duration-200',
              'hover:shadow-sm active:scale-[0.98]'
            )}
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            aria-label="Googleでログイン"
          >
            {googleLoading ? (
              <span className="h-4 w-4 border-2 border-login-muted border-t-login-accent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Googleでログイン
          </Button>

          {/* 区切り線 */}
          <div className="flex items-center gap-3" role="separator">
            <div className="flex-1 h-px bg-login-border" />
            <span className="text-xs text-login-muted font-sans tracking-wider select-none">
              または
            </span>
            <div className="flex-1 h-px bg-login-border" />
          </div>

          {/* メールフォーム */}
          <form
            onSubmit={handleEmailLogin}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-login-label tracking-wide font-sans"
              >
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10 text-sm bg-login-input border-login-border focus-visible:border-login-accent focus-visible:ring-login-accent/20 placeholder:text-login-placeholder"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-login-label tracking-wide font-sans"
                >
                  パスワード
                </Label>
                <button
                  type="button"
                  className="text-xs text-login-accent hover:underline underline-offset-2 font-sans leading-none"
                >
                  パスワードを忘れた方
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-10 text-sm bg-login-input border-login-border focus-visible:border-login-accent focus-visible:ring-login-accent/20 placeholder:text-login-placeholder"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'mt-1 w-full h-11 text-sm font-medium font-sans tracking-wider',
                'bg-login-accent text-login-accent-fg hover:bg-login-accent-hover',
                'shadow-sm transition-all duration-200 hover:shadow active:scale-[0.98]',
                'rounded-lg'
              )}
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-login-accent-fg/40 border-t-login-accent-fg rounded-full animate-spin" />
              ) : (
                'ログイン'
              )}
            </Button>
          </form>
        </div>

        {/* 新規登録リンク */}
        <p className="mt-6 text-center text-xs text-login-muted font-sans">
          アカウントをお持ちでない方は{' '}
          <a
            href="/signup"
            className="text-login-accent hover:underline underline-offset-2 font-medium"
          >
            新規登録
          </a>
        </p>
      </div>

      {/* フッター */}
      <footer className="absolute bottom-6 text-center text-[11px] text-login-muted font-sans tracking-wider select-none z-10">
        &copy; 2026 思い出帳
      </footer>
    </div>
  );
}

/** Google カラーロゴ SVG */
function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** 桜の花びら背景装飾 */
function PetalDecoration() {
  const petals = [
    { top: '8%', left: '7%', size: 18, rotate: 20, opacity: 0.18 },
    { top: '14%', left: '88%', size: 13, rotate: -15, opacity: 0.14 },
    { top: '28%', left: '3%', size: 10, rotate: 45, opacity: 0.12 },
    { top: '55%', left: '91%', size: 16, rotate: 10, opacity: 0.15 },
    { top: '72%', left: '5%', size: 12, rotate: -30, opacity: 0.13 },
    { top: '82%', left: '82%', size: 9, rotate: 60, opacity: 0.11 },
    { top: '90%', left: '40%', size: 14, rotate: -10, opacity: 0.1 },
    { top: '4%', left: '52%', size: 8, rotate: 35, opacity: 0.09 },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((p, i) => (
        <svg
          key={i}
          width={p.size}
          height={p.size}
          viewBox="0 0 20 20"
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            transform: `rotate(${p.rotate}deg)`,
            opacity: p.opacity,
          }}
        >
          {[0, 72, 144, 216, 288].map((deg, j) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const cx = 10 + Math.cos(rad) * 4.2;
            const cy = 10 + Math.sin(rad) * 4.2;
            return (
              <ellipse
                key={j}
                cx={cx}
                cy={cy}
                rx="3.2"
                ry="2.0"
                transform={`rotate(${deg}, ${cx}, ${cy})`}
                fill="var(--login-accent-raw)"
              />
            );
          })}
          <circle cx="10" cy="10" r="1.8" fill="var(--login-accent-raw)" />
        </svg>
      ))}
    </div>
  );
}
