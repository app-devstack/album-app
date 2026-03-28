import { User } from '@/db/schema';

export const MOCK_AUTH_USERS: User[] = [
  {
    id: 'mock-user-1',
    name: 'テストユーザー',
    email: 'test@example.com',
    emailVerified: null,
    image: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];
