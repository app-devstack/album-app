import { User } from '@/db/schema';
import { MOCK_AUTH_USERS } from '@/mocks/user';

/**
 * メールアドレスに一致するユーザをモックデータから取得します。
 */
export const getMockUserByEmail = (email: string): User | null => {
  return MOCK_AUTH_USERS.find((user) => user.email === email) ?? null;
};

/**
 * データベースからメールアドレス一致のユーザを取得
 * @description 本実装ではDBからメールアドレス一致のユーザを取得する
 */
export const getUserByEmail = async (_email: string): Promise<User | null> => {
  return null;
};
