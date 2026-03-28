'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

/** 桜の花びらSVGパス（1枚） */
const PetalSVG = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 32"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 0 C16 6 20 12 12 20 C4 12 8 6 12 0Z" />
  </svg>
);

/** ランダムなアニメーション用パラメータを生成 */
function makePetals(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: (i * 0.22) % 1.2,
    size: 10 + ((i * 7) % 10),
    x: 15 + ((i * 17) % 70), // %
    duration: 1.6 + ((i * 0.3) % 1.0),
    opacity: 0.55 + ((i * 0.1) % 0.45),
    rotate: (i * 53) % 360,
  }));
}

const petals = makePetals(6);

interface UploadProgressCellProps {
  /** 0〜100 */
  progress: number;
  accentBg?: string;
  accentText?: string;
}

export function UploadProgressCell({
  progress,
  accentBg = 'bg-rose-500',
  accentText = 'text-rose-500',
}: UploadProgressCellProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // マウント後にフェードイン
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className={cn(
        'aspect-square rounded-xl overflow-hidden relative flex flex-col items-center justify-center gap-2',
        'bg-muted',
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      role="status"
      aria-label={`アップロード中 ${progress}%`}
    >
      {/* 花びらアニメーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {petals.map((p) => (
          <div
            key={p.id}
            className={cn(accentText, 'absolute bottom-full')}
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `petal-fall ${p.duration}s ${p.delay}s infinite linear`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          >
            <PetalSVG className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* カメラアイコン（跳ねるアニメーション） */}
      <div
        className={cn(
          'relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-md',
          accentBg
        )}
        style={{ animation: 'bounce-gentle 1s ease-in-out infinite' }}
        aria-hidden="true"
      >
        {/* インラインSVGカメラ */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>

      {/* プログレスバー */}
      <div className="relative z-10 w-3/4 flex flex-col items-center gap-1">
        <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300 ease-out', accentBg)}
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
        <span className={cn('text-[10px] font-medium tabular-nums', accentText)}>
          {progress < 100 ? `${progress}%` : '完了！'}
        </span>
      </div>

      {/* キラキラ（完了時） */}
      {progress >= 100 && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ animation: 'sparkle-burst 0.5s ease-out forwards' }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn('absolute w-1 h-1 rounded-full', accentBg)}
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateY(-20px)`,
                animation: `sparkle-dot 0.5s ${i * 0.05}s ease-out forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
