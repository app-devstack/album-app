'use client';

import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useCallback, useLayoutEffect, useRef } from 'react';

gsap.registerPlugin(Flip);

/** `Flip.getState` / `querySelectorAll` 用の既定セレクタ（要素に `data-flip-item` を付与する）。 */
const FLIP_LAYOUT_ITEM_SELECTOR = '[data-flip-item]';

const DEFAULT_FLIP_FROM: Partial<Flip.FromToVars> = {
  duration: 0.5,
  ease: 'power2.inOut',
  absolute: true,
};

/** `useFlipLayoutAnimation` に渡すオプション。 */
type UseFlipLayoutAnimationOptions = {
  /** レイアウト反映後に `Flip.from` を実行するトリガー（例: グリッド密度の値） */
  layoutKey: unknown;
  /** アニメ対象要素のセレクタ（既定: `[data-flip-item]`） */
  itemSelector?: string;
  /** false のとき capture も `Flip.from` も行わない */
  enabled?: boolean;
  /** true のとき `prefers-reduced-motion: reduce` ではアニメをスキップ */
  respectReducedMotion?: boolean;
  /** `Flip.from` に渡すオプション（既定値にマージ） */
  flipFromVars?: Partial<Flip.FromToVars>;
};

/**
 * レイアウト変更を GSAP Flip でアニメーションし、要素が飛ばずに移動する見た目にする。
 *
 * @description
 * **手順**
 *
 * 1. レイアウトの親となる `div` に `rootRef` を渡す。
 * 2. Flip 対象の各子要素に `data-flip-item` を付ける（別セレクタにする場合は `itemSelector` を指定）。
 * 3. レイアウトが変わる状態を更新する**直前**に `captureBeforeLayoutChange()` を呼ぶ（トグルなら `setX` の直前、親にコールバックで渡すなど）。
 * 4. 更新後に変わる値を `layoutKey` に渡しておく。`layoutKey` が変わったタイミングの `useLayoutEffect` で `Flip.from` が実行される。
 *
 * 初回マウントや、`captureBeforeLayoutChange` を呼ばずに `layoutKey` だけが変わった場合はアニメーションしない。
 * `prefers-reduced-motion: reduce` のときは `respectReducedMotion` が true（既定）なら `Flip.from` をスキップする。
 *
 * @example
 * トグルでグリッド列数を切り替える例。
 *
 * ```tsx
 * const gridDensity = useStore((s) => s.gridDensity);
 * const { rootRef, captureBeforeLayoutChange } = useFlipLayoutAnimation({
 *   layoutKey: gridDensity,
 * });
 *
 * return (
 *   <>
 *     <Toggle
 *       onValueChange={(next) => {
 *         if (next === 'a' || next === 'b') {
 *           captureBeforeLayoutChange();
 *           setGridDensity(next);
 *         }
 *       }}
 *     />
 *     <div ref={rootRef} className={cn('grid', GRID_CLASS[gridDensity])}>
 *       {albums.map((album) => (
 *         <div key={album.id} data-flip-item className="min-w-0">
 *           <AlbumCard album={album} />
 *         </div>
 *       ))}
 *     </div>
 *   </>
 * );
 * ```
 *
 * @example
 * `Flip.from` の挙動だけ変えたい場合。
 *
 * ```tsx
 * useFlipLayoutAnimation({
 *   layoutKey: sortKey,
 *   flipFromVars: { duration: 0.35, ease: 'power1.inOut' },
 * });
 * ```
 */
export function useFlipLayoutAnimation({
  layoutKey,
  itemSelector = FLIP_LAYOUT_ITEM_SELECTOR,
  enabled = true,
  respectReducedMotion = true,
  flipFromVars,
}: UseFlipLayoutAnimationOptions) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pendingFlipStateRef = useRef<Flip.FlipState | null>(null);
  const flipFromVarsRef = useRef(flipFromVars);
  flipFromVarsRef.current = flipFromVars;

  const captureBeforeLayoutChange = useCallback(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>(itemSelector);
    if (targets.length === 0) return;
    pendingFlipStateRef.current = Flip.getState(targets);
  }, [enabled, itemSelector]);

  useLayoutEffect(() => {
    const state = pendingFlipStateRef.current;
    pendingFlipStateRef.current = null;
    if (!state || !enabled) return;

    if (
      respectReducedMotion &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    Flip.from(state, {
      ...DEFAULT_FLIP_FROM,
      ...flipFromVarsRef.current,
    });
  }, [layoutKey, enabled, respectReducedMotion]);

  return { rootRef, captureBeforeLayoutChange };
}
