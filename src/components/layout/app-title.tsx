import { AppIcon } from '@/components/layout/app-icon';

export function AppTitle() {
  return (
    <div className="flex flex-col items-center mb-8 gap-3">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-login-card border border-login-border shadow-sm">
        <AppIcon size={38} className="text-login-accent" />
      </div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-medium tracking-widest text-login-fg">
          思い出帳
        </h1>
        <p className="mt-1 text-xs font-sans text-login-muted tracking-wider">
          大切な記憶を、いつでも一緒に。
        </p>
      </div>
    </div>
  );
}
