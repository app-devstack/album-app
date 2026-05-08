'use client';

import type { Photo } from '@/db/schema';
import { useCallback, useEffect, useRef, useState } from 'react';

const LIGHTBOX_HISTORY_MARK = 'albumLightbox' as const;

function mergeHistoryState(
  patch: Record<string, unknown>
): Record<string, unknown> {
  const cur = window.history.state;
  const base =
    cur && typeof cur === 'object' && !Array.isArray(cur)
      ? { ...(cur as Record<string, unknown>) }
      : {};
  Object.assign(base, patch);
  return base;
}

function readPhotoIdFromLocation(): string | null {
  return new URL(window.location.href).searchParams.get('photo');
}

/**
 * ライトボックスを履歴・URL（?photo=）と同期する。
 * グリッドから開いた場合は pushState し、ブラウザバック／ヘッダー戻るで閉じる。
 * 直接 ?photo= で開いた場合は replaceState でクエリを外して閉じる。
 */
export function useAlbumLightboxHistory(photos: Photo[]) {
  const [lightboxItem, setLightboxItemState] = useState<Photo | null>(null);
  /** グリッドから開いた直後のみ true（このとき閉じる操作は history.back） */
  const openedViaHistoryPushRef = useRef(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const syncLightboxFromUrl = useCallback(() => {
    const photoId = readPhotoIdFromLocation();
    if (!photoId) {
      setLightboxItemState(null);
      return;
    }
    const photo =
      photosRef.current.find((p) => p.id === photoId) ?? null;
    setLightboxItemState(photo);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      syncLightboxFromUrl();
      openedViaHistoryPushRef.current = false;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncLightboxFromUrl]);

  // フルリロードや写真リスト更新時に URL の ?photo= と表示を揃える（push 由来の ref は触らない）
  useEffect(() => {
    if (photos.length === 0) return;
    const photoId = readPhotoIdFromLocation();
    if (!photoId) return;
    const photo = photos.find((p) => p.id === photoId) ?? null;
    setLightboxItemState(photo);
  }, [photos]);

  const openLightbox = useCallback((photo: Photo) => {
    const url = new URL(window.location.href);
    url.searchParams.set('photo', photo.id);
    window.history.pushState(
      mergeHistoryState({ [LIGHTBOX_HISTORY_MARK]: true }),
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
    openedViaHistoryPushRef.current = true;
    setLightboxItemState(photo);
  }, []);

  const dismissLightbox = useCallback(() => {
    if (openedViaHistoryPushRef.current) {
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    if (!url.searchParams.has('photo')) {
      setLightboxItemState(null);
      return;
    }
    url.searchParams.delete('photo');
    window.history.replaceState(
      mergeHistoryState({ [LIGHTBOX_HISTORY_MARK]: false }),
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
    setLightboxItemState(null);
    openedViaHistoryPushRef.current = false;
  }, []);

  const closeLightboxAfterDelete = useCallback(() => {
    if (openedViaHistoryPushRef.current) {
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('photo');
    window.history.replaceState(
      mergeHistoryState({ [LIGHTBOX_HISTORY_MARK]: false }),
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
    setLightboxItemState(null);
  }, []);

  return {
    lightboxItem,
    openLightbox,
    dismissLightbox,
    closeLightboxAfterDelete,
  };
}
