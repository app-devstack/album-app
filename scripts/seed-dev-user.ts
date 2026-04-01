/**
 * ローカル D1 にメール／パスワードのテストユーザーを投入する。
 * Better Auth と同じ scrypt 形式でパスワードをハッシュする。
 *
 * 使い方: pnpm db:seed:dev
 * 上書き: DEV_TEST_EMAIL / DEV_TEST_PASSWORD / DEV_TEST_NAME
 */
import { hashPassword } from 'better-auth/crypto';
import { execFileSync } from 'node:child_process';
import { unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { v7 as uuidv7 } from 'uuid';

const email = process.env.DEV_TEST_EMAIL ?? 'dev@localhost.test';
const password = process.env.DEV_TEST_PASSWORD ?? 'devpassword123';
const name = process.env.DEV_TEST_NAME ?? 'ローカル開発';

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

async function main(): Promise<void> {
  const userId = uuidv7();
  const accountId = uuidv7();
  const now = Date.now();
  const hash = await hashPassword(password);

  const sql = [
    `DELETE FROM user WHERE email = '${sqlEscape(email)}';`,
    `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at) VALUES ('${sqlEscape(userId)}', '${sqlEscape(name)}', '${sqlEscape(email)}', NULL, NULL, ${now}, ${now});`,
    `INSERT INTO account (id, account_id, provider_id, userId, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) VALUES ('${sqlEscape(accountId)}', '${sqlEscape(userId)}', 'credential', '${sqlEscape(userId)}', NULL, NULL, NULL, NULL, NULL, NULL, '${sqlEscape(hash)}', ${now}, ${now});`,
  ].join('\n');

  const file = join(tmpdir(), `album-seed-dev-${Date.now()}.sql`);
  writeFileSync(file, sql, 'utf8');
  try {
    execFileSync(
      'pnpm',
      [
        'exec',
        'wrangler',
        'd1',
        'execute',
        'album-app-db',
        '--local',
        '--file',
        file,
      ],
      { stdio: 'inherit', cwd: process.cwd() }
    );
  } finally {
    unlinkSync(file);
  }

  console.log('\nローカルテストユーザー（再実行で同じメールは作り直されます）');
  console.log(`  メール: ${email}`);
  console.log(`  パスワード: ${password}`);
  console.log(`  表示名: ${name}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
