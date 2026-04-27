/** 一覧 API クエリ・TanStack queryKey・DB ソートと同一。作成日 text の辞書順＝新しい/古い順。 */
export const ALBUM_SORT_ORDER_VALUES = ['created_desc', 'created_asc'] as const;

/** アルバム一覧のソート順。作成日基準で新しい順 or 古い順。 */
export type AlbumSortOrder = (typeof ALBUM_SORT_ORDER_VALUES)[number];

/** アルバム一覧のソート順のデフォルト値。 */
export const DEFAULT_ALBUM_SORT_ORDER = 'created_desc' satisfies AlbumSortOrder;

/** 型ガード用 ソートフラグ関数 */
export function isAlbumSortOrder(v: string): v is AlbumSortOrder {
  return (ALBUM_SORT_ORDER_VALUES as readonly string[]).includes(v);
}
