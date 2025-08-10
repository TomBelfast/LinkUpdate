import { InferModel } from 'drizzle-orm';
import { mysqlTable, varchar, text, timestamp, mysqlEnum, index, foreignKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const ideas = mysqlTable('ideas', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  tags: text('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id]
  })
}));

export interface IdeaMetadata {
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  tags: string[];
  userId: string;
}

export type Idea = InferModel<typeof ideas>;

export function createIdeaMetadata(data: IdeaMetadata): IdeaMetadata {
  return {
    title: data.title,
    description: data.description,
    status: data.status,
    tags: data.tags,
    userId: data.userId
  };
} 