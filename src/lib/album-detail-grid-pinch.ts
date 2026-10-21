/** スマホ幅のメディア一覧で選べる列数。 */
export const ALBUM_DETAIL_PHONE_COLUMNS = [2, 3, 4] as const;

/** スマホ幅のメディア一覧の列数。 */
export type AlbumDetailPhoneColumns =
  (typeof ALBUM_DETAIL_PHONE_COLUMNS)[number];

/** 指を開いたとみなす距離比（開始時を 1）。 */
const PINCH_OUT_RATIO = 1.18;

/** 指を閉じたとみなす距離比。 */
const PINCH_IN_RATIO = 1 / PINCH_OUT_RATIO;

/**
 * 保存値をスマホの列数として解釈する。
 * @description 以前保存した 5 列は 4 列として読む。
 * @param value - localStorage などから読んだ値
 */
export function parseAlbumDetailPhoneColumns(
  value: unknown
): AlbumDetailPhoneColumns {
  if (value === 5) return 4;
  if (value === 2 || value === 3 || value === 4) {
    return value;
  }
  return 2;
}

/**
 * 指を離したときの列数を返す。1 回のピンチで隣の列まで。
 * @param columns - ピンチ開始時の列数
 * @param ratio - 開始時の指距離を 1 とした離したときの距離
 */
export function nextPhoneColumnsFromPinchRatio(
  columns: AlbumDetailPhoneColumns,
  ratio: number
): AlbumDetailPhoneColumns {
  if (ratio >= PINCH_OUT_RATIO) {
    return parseAlbumDetailPhoneColumns(Math.max(2, columns - 1));
  }
  if (ratio <= PINCH_IN_RATIO) {
    return parseAlbumDetailPhoneColumns(Math.min(4, columns + 1));
  }
  return columns;
}
