import { eq } from 'drizzle-orm';
import { db } from './index';
import { projects, tasks, ideas } from './schema/todo';
import type { ProjectMetadata, TaskMetadata, IdeaMetadata } from './schema/todo';

// Funkcje dla projektów
export async function createProject(userId: string, metadata: ProjectMetadata) {
  const projectData = {
    id: crypto.randomUUID(),
    userId,
    name: metadata.name,
    description: metadata.description,
    status: metadata.status === 'ARCHIVED' ? 'COMPLETED' : metadata.status,
    priority: metadata.priority,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(projects).values(projectData);
  return projectData;
}

export async function listProjects(userId: string) {
  const results = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId));
  return results;
}

// Funkcje dla zadań
export async function createTask(userId: string, metadata: TaskMetadata) {
  const taskData = {
    id: crypto.randomUUID(),
    userId,
    description: metadata.description,
    status: metadata.status,
    projectId: metadata.projectId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(tasks).values(taskData);
  return taskData;
}

export async function listTasks(userId: string) {
  const results = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));
  return results;
}

// Funkcje dla pomysłów
export async function createIdea(userId: string, metadata: IdeaMetadata) {
  const ideaData = {
    id: crypto.randomUUID(),
    userId,
    title: metadata.title,
    description: metadata.description,
    status: metadata.status === 'PUBLISHED' ? 'ACTIVE' : metadata.status,
    tags: JSON.stringify(metadata.tags),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(ideas).values(ideaData);
  return ideaData;
}

export async function listIdeas(userId: string) {
  const results = await db
    .select()
    .from(ideas)
    .where(eq(ideas.userId, userId));
  return results;
} 