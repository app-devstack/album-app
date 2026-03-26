import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 処理を`ms`秒だけ一時停止する
 */
export const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};
