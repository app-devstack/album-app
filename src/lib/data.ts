// ============================================================
// 思い出帳 — データ型とモックデータ
// ============================================================

export type AccentColor =
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'violet'
  | 'slate';

export interface AccentColorConfig {
  id: AccentColor;
  label: string;
  bg: string;
  bgHover: string;
  bgLight: string;
  text: string;
  textHover: string;
  border: string;
  ring: string;
  dot: string;
}

export const ACCENT_COLORS: AccentColorConfig[] = [
  {
    id: 'blue',
    label: '青',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    textHover: 'hover:text-blue-700',
    border: 'border-blue-600',
    ring: 'ring-blue-600',
    dot: 'bg-blue-600',
  },
  {
    id: 'emerald',
    label: '緑',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-600',
    textHover: 'hover:text-emerald-700',
    border: 'border-emerald-600',
    ring: 'ring-emerald-600',
    dot: 'bg-emerald-600',
  },
  {
    id: 'rose',
    label: '桜',
    bg: 'bg-rose-500',
    bgHover: 'hover:bg-rose-600',
    bgLight: 'bg-rose-50',
    text: 'text-rose-500',
    textHover: 'hover:text-rose-600',
    border: 'border-rose-500',
    ring: 'ring-rose-500',
    dot: 'bg-rose-500',
  },
  {
    id: 'amber',
    label: '琥珀',
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    bgLight: 'bg-amber-50',
    text: 'text-amber-500',
    textHover: 'hover:text-amber-600',
    border: 'border-amber-500',
    ring: 'ring-amber-500',
    dot: 'bg-amber-500',
  },
  {
    id: 'violet',
    label: '藤',
    bg: 'bg-violet-600',
    bgHover: 'hover:bg-violet-700',
    bgLight: 'bg-violet-50',
    text: 'text-violet-600',
    textHover: 'hover:text-violet-700',
    border: 'border-violet-600',
    ring: 'ring-violet-600',
    dot: 'bg-violet-600',
  },
  {
    id: 'slate',
    label: '鈍',
    bg: 'bg-slate-700',
    bgHover: 'hover:bg-slate-800',
    bgLight: 'bg-slate-100',
    text: 'text-slate-700',
    textHover: 'hover:text-slate-800',
    border: 'border-slate-700',
    ring: 'ring-slate-700',
    dot: 'bg-slate-700',
  },
];

export const COVER_OPTIONS = [
  {
    id: 'c1',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
    alt: '自然',
  },
  {
    id: 'c2',
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
    alt: '都市',
  },
  {
    id: 'c3',
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80',
    alt: '人物',
  },
  {
    id: 'c4',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
    alt: 'みんな',
  },
  {
    id: 'c5',
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
    alt: '旅行',
  },
  {
    id: 'c6',
    url: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?w=400&q=80',
    alt: '海',
  },
];
