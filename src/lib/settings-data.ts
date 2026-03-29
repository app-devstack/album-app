// ============================================================
// 思い出帳 — 設定ページ用データ型・モックデータ
// ============================================================

export interface SettingsGroup {
  id: string;
  name: string;
  memberCount: number;
  role: 'owner' | 'member';
  coverUrl?: string;
}

export interface SettingsAccount {
  name: string;
  email: string;
  image?: string | null;
}

// ============================================================
// モックデータ（実装完了後は API/DB から取得する）
// ============================================================

export const MOCK_GROUPS: SettingsGroup[] = [
  {
    id: 'g1',
    name: '家族アルバム',
    memberCount: 4,
    role: 'owner',
    coverUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&q=70',
  },
  {
    id: 'g2',
    name: '旅の仲間',
    memberCount: 6,
    role: 'member',
    coverUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&q=70',
  },
];
