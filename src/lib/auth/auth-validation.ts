import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, '8文字以上で入力してください'),
});

export const authEmailSchema = z.object({
  email: z.string().trim().email('メールアドレスの形式が正しくありません'),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, 'お名前を入力してください'),
    email: z.string().trim().email('メールアドレスの形式が正しくありません'),
    password: z.string().min(8, '8文字以上で入力してください'),
    passwordConfirm: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: 'パスワードが一致しません',
    path: ['passwordConfirm'],
  });
