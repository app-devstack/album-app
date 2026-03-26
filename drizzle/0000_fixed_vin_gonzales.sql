CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'personal' NOT NULL,
	`cover_url` text DEFAULT '' NOT NULL,
	`created_by` text DEFAULT '自分' NOT NULL,
	`member_name` text,
	`member_avatar` text,
	`shared_with` text,
	`location` text,
	`created_at` text DEFAULT (date('now')) NOT NULL,
	`updated_at` text DEFAULT (date('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `memos` (
	`id` text PRIMARY KEY NOT NULL,
	`album_id` text NOT NULL,
	`body` text NOT NULL,
	`mood` text,
	`created_at` text DEFAULT (date('now')) NOT NULL,
	`updated_at` text DEFAULT (date('now')) NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`album_id` text NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`alt` text DEFAULT '' NOT NULL,
	`caption` text,
	`media_type` text DEFAULT 'image' NOT NULL,
	`duration` real,
	`r2_key` text,
	`added_at` text DEFAULT (date('now')) NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);
