import { MOOD_OPTIONS } from './album-detail-memo-constants';

/** 気分のラベルから対応するスタイルを取得する。 */
export function getMoodStyle(label: string | undefined) {
  return (
    MOOD_OPTIONS.find((m) => m.label === label)?.color ??
    'bg-muted text-muted-foreground'
  );
}
