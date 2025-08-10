import { mysqlTable, varchar, text, timestamp, int, binary } from 'drizzle-orm/mysql-core';

export const links = mysqlTable('links', {
  id: int('id').primaryKey().autoincrement(),
  url: varchar('url', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  prompt: text('prompt'),
  userId: varchar('user_id', { length: 36 }), // Nullable for existing links
  imageData: binary('image_data', { length: 255 }),
  imageMimeType: varchar('image_mime_type', { length: 50 }),
  thumbnailData: binary('thumbnail_data', { length: 255 }),
  thumbnailMimeType: varchar('thumbnail_mime_type', { length: 50 }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export * from './users';
export * from './projects';
export * from './tasks';
export * from './ideas'; 