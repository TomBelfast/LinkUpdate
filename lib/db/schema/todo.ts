import { InferModel } from 'drizzle-orm';
import { mysqlTable, varchar, text, timestamp, mysqlEnum, int, boolean, index, foreignKey, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

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

export const resources = mysqlTable('resources', {
  id: varchar('id', { length: 36 }).primaryKey(),
  url: varchar('url', { length: 2048 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: mysqlEnum('type', ['VIDEO', 'ARTICLE', 'TOOL', 'DATASET', 'OTHER']).notNull(),
  project_id: varchar('project_id', { length: 36 }).notNull(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => ({
  projectIdIdx: index('project_id_idx').on(table.project_id),
  userIdIdx: index('user_id_idx').on(table.user_id),
  typeIdx: index('type_idx').on(table.type),
  projectFk: foreignKey({
    columns: [table.project_id],
    foreignColumns: [projects.id]
  }),
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [users.id]
  })
}));

export const widget_configurations = mysqlTable('widget_configurations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  widget_type: varchar('widget_type', { length: 50 }).notNull(),
  configuration: text('configuration'), // Przechowywane jako JSON string
  position: int('position').notNull(),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.user_id),
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [users.id]
  })
}));

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

export const videos = mysqlTable('videos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  request_id: varchar('request_id', { length: 36 }).notNull(),
  prompt: text('prompt').notNull(),
  duration: int('duration').notNull(),
  aspect_ratio: varchar('aspect_ratio', { length: 20 }).notNull(),
  resolution: varchar('resolution', { length: 20 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.user_id),
  userFk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [users.id]
  })
}));

export interface ProjectMetadata {
  name: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  user_id: string;
}

export interface TaskMetadata {
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'PENDING_FEEDBACK' | 'COMPLETED';
  project_id: string;
  user_id: string;
  assigned_to?: string;
}

export interface IdeaMetadata {
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  tags: string[];
  userId: string;
}

export interface ResourceMetadata {
  url: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'ARTICLE' | 'TOOL' | 'DATASET' | 'OTHER';
  project_id: string;
  user_id: string;
}

export interface WidgetConfigurationMetadata {
  widget_type: string;
  configuration: Record<string, unknown>;
  position: number;
  user_id: string;
}

export interface VideoMetadata {
  user_id: string;
  request_id: string;
  prompt: string;
  duration: number;
  aspect_ratio: string;
  resolution: string;
  model: string;
}

export type Project = InferModel<typeof projects>;
export type Task = InferModel<typeof tasks>;
export type Idea = InferModel<typeof ideas>;
export type Resource = InferModel<typeof resources>;
export type WidgetConfiguration = InferModel<typeof widget_configurations>;
export type User = InferModel<typeof users>;
export type Video = InferModel<typeof videos>;

export function createProjectMetadata(data: ProjectMetadata): ProjectMetadata {
  return {
    name: data.name,
    description: data.description,
    status: data.status,
    priority: data.priority,
    user_id: data.user_id
  };
}

export function createTaskMetadata(data: TaskMetadata): TaskMetadata {
  return {
    description: data.description,
    status: data.status,
    project_id: data.project_id,
    user_id: data.user_id,
    assigned_to: data.assigned_to
  };
}

export function createIdeaMetadata(data: IdeaMetadata): IdeaMetadata {
  return {
    title: data.title,
    description: data.description,
    status: data.status,
    tags: data.tags,
    userId: data.userId
  };
}

export function createResourceMetadata(data: ResourceMetadata): ResourceMetadata {
  return {
    url: data.url,
    title: data.title,
    description: data.description,
    type: data.type,
    project_id: data.project_id,
    user_id: data.user_id
  };
}

export function createWidgetConfigurationMetadata(data: WidgetConfigurationMetadata): WidgetConfigurationMetadata {
  return {
    widget_type: data.widget_type,
    configuration: data.configuration,
    position: data.position,
    user_id: data.user_id
  };
}

export function createVideoMetadata(data: VideoMetadata): VideoMetadata {
  return {
    user_id: data.user_id,
    request_id: data.request_id,
    prompt: data.prompt,
    duration: data.duration,
    aspect_ratio: data.aspect_ratio,
    resolution: data.resolution,
    model: data.model
  };
} 