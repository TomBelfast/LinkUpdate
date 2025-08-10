import { mysqlTable, varchar, text, timestamp, mysqlEnum, index, foreignKey } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['ACTIVE', 'PAUSED', 'COMPLETED']).notNull().default('ACTIVE'),
  priority: mysqlEnum('priority', ['LOW', 'MEDIUM', 'HIGH']).notNull().default('MEDIUM'),
  color: varchar('color', { length: 7 }),
  icon: varchar('icon', { length: 50 }),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.user_id),
  statusIdx: index('status_idx').on(table.status),
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [users.id]
  })
})); 