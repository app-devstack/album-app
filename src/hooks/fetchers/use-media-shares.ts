'use client';

import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** 限定公開のクエリキー。 */
export const mediaShareKeys = {
  all: ['media-shares'] as const,
  photo: (photoId: string) => ['media-shares', 'photo', photoId] as const,
};

/** 公開一覧の1件。URLは含めない。 */
export interface MediaShareSummary {
  photoId: string;
  mediaType: 'image' | 'video';
  albumId: string;
  albumTitle: string;
  createdAt: string;
}

/**
 * 見られるアルバムの公開中一覧を読む。
 */
export function useMediaShares() {
  return useQuery({
    queryKey: mediaShareKeys.all,
    queryFn: async () => {
      const res = await api.shares.$get();
      if (!res.ok) throw new Error('公開一覧を読み込めませんでした');
      const body = await res.json();
      return body.shares as MediaShareSummary[];
    },
  });
}

/**
 * 1件の現在の公開トークンを読む。未公開なら null。
 * @param photoId - 対象の写真または動画
 * @param enabled - ダイアログを開いているときだけ取る
 */
export function usePhotoShare(photoId: string, enabled: boolean) {
  return useQuery({
    queryKey: mediaShareKeys.photo(photoId),
    enabled,
    queryFn: async () => {
      const res = await api.shares['by-photo'][':photoId'].$get({
        param: { photoId },
      });
      if (!res.ok) throw new Error('公開状態を読み込めませんでした');
      const body = await res.json();
      return body.share;
    },
  });
}

/**
 * 限定公開を発行する。公開中なら同じトークンが返る。
 */
export function useCreateMediaShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      const res = await api.shares.$post({ json: { photoId } });
      if (!res.ok) throw new Error('公開リンクを発行できませんでした');
      const body = await res.json();
      return body.token;
    },
    onSuccess: async (_token, photoId) => {
      await queryClient.invalidateQueries({ queryKey: mediaShareKeys.all });
      await queryClient.invalidateQueries({
        queryKey: mediaShareKeys.photo(photoId),
      });
    },
  });
}

/**
 * 限定公開を破棄する。
 */
export function useRevokeMediaShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      const res = await api.shares['by-photo'][':photoId'].$delete({
        param: { photoId },
      });
      if (!res.ok) throw new Error('公開をオフにできませんでした');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mediaShareKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['media-shares'] });
    },
  });
}

/**
 * 限定公開ページの絶対URLを返す。
 * @param token - 発行済みトークン
 */
export function mediaShareUrl(token: string): string {
  return `${window.location.origin}/s/${token}`;
}
