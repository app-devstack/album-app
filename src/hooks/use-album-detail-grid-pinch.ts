'use client';

import {
  nextPhoneColumnsFromPinchRatio,
  pinchFollowScale,
} from '@/lib/album-detail-grid-pinch';
import { useAlbumDetailGridStore } from '@/stores/albumDetailGridStore';
import gsap from 'gsap';
import { useEffect, type RefObject } from 'react';

/** 今 2 列になる幅。Tailwind の `sm`（640px）未満。 */
const PHONE_GRID_QUERY = '(max-width: 639px)';

const FLIP_ITEM_SELECTOR = '[data-flip-item]';

/** アルバム詳細グリッドのピンチに渡す参照。 */
export interface UseAlbumDetailGridPinchOptions {
  gridRef: RefObject<HTMLElement | null>;
  active: boolean; // グリッドが描画されているとき true
  captureBeforeLayoutChange: () => void; // 列数を変える直前に呼ぶ Flip の記録
}

/**
 * スマホ幅のメディア一覧で、2本指ピンチにより列数を1段階変える。
 * @description 指が触れているあいだはセルを少し拡縮し、離したときに隣の列へ着地するか元へ戻す。
 */
export function useAlbumDetailGridPinch({
  gridRef,
  active,
  captureBeforeLayoutChange,
}: UseAlbumDetailGridPinchOptions): void {
  useEffect(() => {
    if (!active) return;
    const grid = gridRef.current;
    if (!grid) return;

    const gesture = {
      active: false,
      startDistance: 0,
      lastRatio: 1,
      startColumns: useAlbumDetailGridStore.getState().phoneColumns,
    };

    const items = () => grid.querySelectorAll<HTMLElement>(FLIP_ITEM_SELECTOR);

    const reducedMotion = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isPhone = () => window.matchMedia(PHONE_GRID_QUERY).matches;

    const setScale = (scale: number) => {
      gsap.set(items(), {
        scale,
        transformOrigin: 'center center',
      });
    };

    const settleScale = () => {
      if (reducedMotion()) {
        gsap.set(items(), { clearProps: 'transform' });
        return;
      }
      gsap.to(items(), {
        scale: 1,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto',
        transformOrigin: 'center center',
        onComplete: () => {
          if (gesture.active) return;
          gsap.set(items(), { clearProps: 'transform' });
        },
      });
    };

    const distance = (touches: TouchList) => {
      const first = touches[0];
      const second = touches[1];
      if (!first || !second) return 0;
      return Math.hypot(
        first.clientX - second.clientX,
        first.clientY - second.clientY
      );
    };

    const endGesture = () => {
      if (!gesture.active) return;
      gesture.active = false;
      const ratio = gesture.lastRatio;
      const next = isPhone()
        ? nextPhoneColumnsFromPinchRatio(gesture.startColumns, ratio)
        : gesture.startColumns;

      if (next === gesture.startColumns) {
        settleScale();
        return;
      }

      gsap.killTweensOf(items());
      gsap.set(items(), { clearProps: 'transform' });
      captureBeforeLayoutChange();
      useAlbumDetailGridStore.getState().setPhoneColumns(next);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!isPhone() || event.touches.length !== 2) return;
      const startDistance = distance(event.touches);
      if (startDistance <= 0) return;
      gsap.killTweensOf(items());
      gesture.active = true;
      gesture.startDistance = startDistance;
      gesture.lastRatio = 1;
      gesture.startColumns = useAlbumDetailGridStore.getState().phoneColumns;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!gesture.active || event.touches.length < 2) return;
      event.preventDefault();
      const nextDistance = distance(event.touches);
      if (gesture.startDistance <= 0 || nextDistance <= 0) return;
      gesture.lastRatio = nextDistance / gesture.startDistance;
      if (reducedMotion()) return;
      setScale(pinchFollowScale(gesture.lastRatio));
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!gesture.active) return;
      if (event.touches.length >= 2) return;
      endGesture();
    };

    grid.addEventListener('touchstart', onTouchStart, { passive: true });
    grid.addEventListener('touchmove', onTouchMove, { passive: false });
    grid.addEventListener('touchend', onTouchEnd);
    grid.addEventListener('touchcancel', onTouchEnd);

    return () => {
      grid.removeEventListener('touchstart', onTouchStart);
      grid.removeEventListener('touchmove', onTouchMove);
      grid.removeEventListener('touchend', onTouchEnd);
      grid.removeEventListener('touchcancel', onTouchEnd);
      gsap.killTweensOf(items());
      gsap.set(items(), { clearProps: 'transform' });
    };
  }, [active, captureBeforeLayoutChange, gridRef]);
}
