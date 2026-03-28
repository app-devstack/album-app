import { User } from '@/db/schema';

/**
 * データベースからメールアドレス一致のユーザを取得
 * @description 本実装ではDBからメールアドレス一致のユーザを取得する
 */
export const getUserByEmail = async (_email: string): Promise<User | null> => {
  return null;
};
