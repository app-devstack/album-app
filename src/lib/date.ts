import { format, isValid, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

function toDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  const parsed = parseISO(input);
  if (isValid(parsed)) return parsed;
  return new Date(input);
}

/** アルバム・メモ・グループなど、和文の年月日表示（例: 2024年3月5日） */
export function formatJapaneseDate(input: string | Date): string {
  return format(toDate(input), 'yyyy年M月d日', { locale: ja });
}
