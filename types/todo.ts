import { InferModel } from 'drizzle-orm';
import { projects, tasks, ideas, resources, widgetConfigurations } from '@/db/schema/todo';

// Typy dla projektów
export type Project = InferModel<typeof projects>;
export type NewProject = InferModel<typeof projects, 'insert'>;

// Typy dla zadań
export type Task = InferModel<typeof tasks>;
export type NewTask = InferModel<typeof tasks, 'insert'>;

// Typy dla pomysłów
export type Idea = InferModel<typeof ideas>;
export type NewIdea = InferModel<typeof ideas, 'insert'>;

// Typy dla zasobów
export type Resource = InferModel<typeof resources>;
export type NewResource = InferModel<typeof resources, 'insert'>;

// Typy dla konfiguracji widgetów
export type WidgetConfiguration = InferModel<typeof widgetConfigurations>;
export type NewWidgetConfiguration = InferModel<typeof widgetConfigurations, 'insert'>;

// Typy dla statusów
export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING_FEEDBACK' | 'COMPLETED';
export type IdeaStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ResourceType = 'VIDEO' | 'ARTICLE' | 'TOOL' | 'DATASET' | 'OTHER';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// Interfejs dla konfiguracji widgetu
export interface WidgetConfig {
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings: Record<string, unknown>;
}

// Typy dla filtrów
export interface TodoFilters {
  status?: ProjectStatus | TaskStatus | IdeaStatus;
  priority?: PriorityLevel;
  search?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Interfejsy bazowe
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Główne interfejsy
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  color?: string;
  icon?: string;
}

export interface Task extends BaseEntity {
  description: string;
  status: TaskStatus;
  dueDate?: Date;
  projectId: string;
  assignedTo?: string;
}

export interface Idea extends BaseEntity {
  title: string;
  description?: string;
  status: IdeaStatus;
  tags?: string[]; // Przechowywane jako JSON
}

export interface Resource extends BaseEntity {
  url: string;
  title: string;
  description?: string;
  type: ResourceType;
  projectId: string;
}

export interface WidgetConfiguration extends BaseEntity {
  widgetType: string;
  configuration?: Record<string, unknown>; // Przechowywane jako JSON
  position: number;
}

// Typy dla requestów
export interface CreateProjectRequest {
  name: string;
  description?: string;
  priority?: PriorityLevel;
  color?: string;
  icon?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus;
}

export interface CreateTaskRequest {
  description: string;
  projectId: string;
  dueDate?: Date;
  assignedTo?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
}

export interface CreateIdeaRequest {
  title: string;
  description?: string;
  tags?: string[];
}

export interface UpdateIdeaRequest extends Partial<CreateIdeaRequest> {
  status?: IdeaStatus;
}

export interface CreateResourceRequest {
  url: string;
  title: string;
  description?: string;
  type: ResourceType;
  projectId: string;
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {}

export interface CreateWidgetConfigurationRequest {
  widgetType: string;
  configuration?: Record<string, unknown>;
  position: number;
}

export interface UpdateWidgetConfigurationRequest extends Partial<CreateWidgetConfigurationRequest> {}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
} 