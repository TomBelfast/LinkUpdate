import { mysqlTable, varchar, text, timestamp, mysqlEnum, index, foreignKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { projects } from './projects';

export const tasks = mysqlTable('tasks', {
  id: varchar('id', { length: 36 }).primaryKey(),
  description: text('description').notNull(),
  status: mysqlEnum('status', ['NEW', 'IN_PROGRESS', 'PENDING_FEEDBACK', 'COMPLETED']).notNull().default('NEW'),
  due_date: timestamp('due_date'),
  project_id: varchar('project_id', { length: 36 }).notNull(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  assigned_to: varchar('assigned_to', { length: 36 }),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => ({
  projectIdIdx: index('project_id_idx').on(table.project_id),
  userIdIdx: index('user_id_idx').on(table.user_id),
  statusIdx: index('status_idx').on(table.status),
  projectFk: foreignKey({
    columns: [table.project_id],
    foreignColumns: [projects.id]
  }),
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [users.id]
  }),
  assignedToFk: foreignKey({
    columns: [table.assigned_to],
    foreignColumns: [users.id]
  })
})); 