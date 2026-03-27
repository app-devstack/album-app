import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ============================================================
// auth テーブル
// ============================================================

export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: text('email_verified'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp_ms',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp_ms',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const verifications = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

// ============================================================
// albums テーブル
// ============================================================
export const albums = sqliteTable('albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type', { enum: ['personal', 'family'] })
    .notNull()
    .default('personal'),
  coverUrl: text('cover_url').notNull().default(''),
  createdBy: text('created_by').notNull().default('自分'),
  memberName: text('member_name'),
  memberAvatar: text('member_avatar'),
  sharedWith: text('shared_with').$type<string[]>(), // JSON array string
  location: text('location'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(date('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(date('now'))`),
});

// ============================================================
// photos テーブル
// ============================================================
export const photos = sqliteTable('photos', {
  id: text('id').primaryKey(),
  albumId: text('album_id')
    .notNull()
    .references(() => albums.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  alt: text('alt').notNull().default(''),
  caption: text('caption'),
  mediaType: text('media_type', { enum: ['image', 'video'] })
    .notNull()
    .default('image'),
  duration: real('duration'),
  r2Key: text('r2_key'), // R2 object key for uploaded files
  addedAt: text('added_at')
    .notNull()
    .default(sql`(date('now'))`),
});

// ============================================================
// memos テーブル
// ============================================================
export const memos = sqliteTable('memos', {
  id: text('id').primaryKey(),
  albumId: text('album_id')
    .notNull()
    .references(() => albums.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  mood: text('mood'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(date('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(date('now'))`),
});

// ============================================================
// Type exports
// ============================================================
export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type Memo = typeof memos.$inferSelect;
export type NewMemo = typeof memos.$inferInsert;
export type User = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
