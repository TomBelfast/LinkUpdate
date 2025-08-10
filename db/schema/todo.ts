import { mysqlTable, varchar, text, timestamp, mysqlEnum, int } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['ACTIVE', 'PAUSED', 'COMPLETED']).notNull().default('ACTIVE'),
  priority: mysqlEnum('priority', ['LOW', 'MEDIUM', 'HIGH']).notNull().default('MEDIUM'),
  color: varchar('color', { length: 7 }),
  icon: varchar('icon', { length: 50 }),
  userId: varchar('user_id', { length: 128 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const tasks = mysqlTable('tasks', {
  id: varchar('id', { length: 128 }).primaryKey(),
  description: text('description').notNull(),
  status: mysqlEnum('status', ['NEW', 'IN_PROGRESS', 'PENDING_FEEDBACK', 'COMPLETED']).notNull().default('NEW'),
  dueDate: timestamp('due_date'),
  projectId: varchar('project_id', { length: 128 }).notNull(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  assignedTo: varchar('assigned_to', { length: 128 }),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const ideas = mysqlTable('ideas', {
  id: varchar('id', { length: 128 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['DRAFT', 'ACTIVE', 'ARCHIVED']).notNull().default('DRAFT'),
  tags: text('tags'), // Przechowywane jako JSON string
  userId: varchar('user_id', { length: 128 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const resources = mysqlTable('resources', {
  id: varchar('id', { length: 128 }).primaryKey(),
  url: varchar('url', { length: 2048 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: mysqlEnum('type', ['VIDEO', 'ARTICLE', 'TOOL', 'DATASET', 'OTHER']).notNull(),
  projectId: varchar('project_id', { length: 128 }).notNull(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const widgetConfigurations = mysqlTable('widget_configurations', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  widgetType: varchar('widget_type', { length: 50 }).notNull(),
  configuration: text('configuration'), // Przechowywane jako JSON string
  position: int('position').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}); 