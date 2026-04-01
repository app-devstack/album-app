/** group_members.role と API/表示の共通ヘルパー */
export function isGroupAdmin(role: string | undefined): boolean {
  return role === 'owner' || role === 'editor';
}

/**
 * グループロールを日本語表記に変換する
 * @param role 'owner' | 'editor' | 'member'
 * @returns 'オーナー' | '編集者' | 'メンバー' | role
 */
export function groupRoleLabelJa(role: string): string {
  switch (role) {
    case 'owner':
      return 'オーナー';
    case 'editor':
      return '編集者';
    case 'member':
      return 'メンバー';
    default:
      return role;
  }
}
