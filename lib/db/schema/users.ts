import { InferModel } from 'drizzle-orm';
import { mysqlTable, varchar, text, timestamp, int, boolean, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  email_verified: timestamp('email_verified'),
  image: text('image'),
  password: text('password'),
  credits: int('credits').notNull().default(0),
  advanced: int('advanced').notNull().default(0),
  subscribed: boolean('subscribed').notNull().default(false),
  paid: boolean('paid').notNull().default(false),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email)
}));

export type User = InferModel<typeof users>; 