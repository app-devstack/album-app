'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { AccentColorConfig } from '@/lib/data';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ImagePlus, NotebookPen, type LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

/** アルバム詳細画面の下部固定アクションボタン群のプロパティ。 */
export interface AlbumDetailStickyActionsProps {
  accentConfig: AccentColorConfig; // アクセントカラーの設定
  onAddPhoto: () => void; // 写真追加時のハンドラ
  onAddMemo: () => void; // メモ追加時のハンドラ
  isHidden?: boolean; // フォーム表示時などに非表示にするフラグ
}

/** Sticky Actions コンポーネント用のアニメーションフック */
function useStickyActionsAnimation(isHidden: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isHidden) {
      gsap.to(containerRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        pointerEvents: 'none',
      });
    } else {
      gsap.to(containerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        pointerEvents: 'auto',
      });
    }
  }, [isHidden]);

  return containerRef;
}

/** アルバム詳細画面の下部に固定表示されるアクションボタン群。 */
export function AlbumDetailStickyActions({
  accentConfig,
  onAddPhoto,
  onAddMemo,
  isHidden = false,
}: AlbumDetailStickyActionsProps) {
  const containerRef = useStickyActionsAnimation(isHidden);

  return (
    <div ref={containerRef} className="sticky bottom-6 z-40 w-fit mx-auto">
      <div className="inline-flex items-center rounded-full border border-border bg-muted/50 backdrop-blur-[2px]">
        <StickyActionButton
          icon={ImagePlus}
          onClick={onAddPhoto}
          label="写真"
          className="rounded-l-full"
          accentConfig={accentConfig}
        />

        <div className="h-8">
          <Separator orientation="vertical" className="bg-border" />
        </div>

        <StickyActionButton
          icon={NotebookPen}
          onClick={onAddMemo}
          label="メモ"
          className="rounded-r-full"
          accentConfig={accentConfig}
        />
      </div>
    </div>
  );
}

/** 固定アクションボタンのプロパティ。 */
interface StickyActionButtonProps {
  icon: LucideIcon; // 表示するアイコン
  onClick: () => void; // クリック時のハンドラ
  label: string; // ボタンのラベルテキスト
  className?: string; // 追加のスタイルクラス
  accentConfig: AccentColorConfig; // アクセントカラーの設定
}

/** 個別のアクションボタンコンポーネント。 */
function StickyActionButton({
  icon: Icon,
  onClick,
  label,
  className,
  accentConfig,
}: StickyActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-label={`${label}を追加`}
      className={cn(
        'h-12 w-24 rounded-none hover:bg-black/5 hover:text-current',
        accentConfig.text,
        className
      )}
    >
      <Icon size={28} className="size-6" strokeWidth={2} />

      <span
        className={cn(
          'text-muted-foreground text-xs text-[10px] opacity-90 font-bold',
          accentConfig.text
        )}
      >
        {label}
      </span>
    </Button>
  );
}
