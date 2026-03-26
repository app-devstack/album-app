import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

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
