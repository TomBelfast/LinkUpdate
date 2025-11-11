import { eq } from 'drizzle-orm';
import { getDb } from './index';
import { projects, tasks, ideas } from './schema/todo';
import type { ProjectMetadata, TaskMetadata, IdeaMetadata } from './schema/todo';

// Funkcje dla projektów
export async function createProject(userId: string, metadata: ProjectMetadata) {
  const db = await getDb();
  const projectData = {
    id: crypto.randomUUID(),
    user_id: userId,
    name: metadata.name,
    description: metadata.description,
    status: metadata.status,
    priority: metadata.priority,
    created_at: new Date(),
    updated_at: new Date()
  };

  await db.insert(projects).values(projectData);
  return projectData;
}

export async function listProjects(userId: string) {
  const db = await getDb();
  const results = await db
    .select()
    .from(projects)
    .where(eq(projects.user_id, userId));
  return results;
}

// Funkcje dla zadań
export async function createTask(userId: string, metadata: TaskMetadata) {
  const db = await getDb();
  const taskData = {
    id: crypto.randomUUID(),
    user_id: userId,
    description: metadata.description,
    status: metadata.status,
    project_id: metadata.project_id,
    created_at: new Date(),
    updated_at: new Date()
  };

  await db.insert(tasks).values(taskData);
  return taskData;
}

export async function listTasks(userId: string) {
  const db = await getDb();
  const results = await db
    .select()
    .from(tasks)
    .where(eq(tasks.user_id, userId));
  return results;
}

// Funkcje dla pomysłów
export async function createIdea(userId: string, metadata: IdeaMetadata) {
  const db = await getDb();
  const ideaData = {
    id: crypto.randomUUID(),
    userId: userId,
    title: metadata.title,
    description: metadata.description,
    status: metadata.status,
    tags: metadata.tags,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(ideas).values(ideaData);
  return ideaData;
}

export async function listIdeas(userId: string) {
  const db = await getDb();
  const results = await db
    .select()
    .from(ideas)
    .where(eq(ideas.userId, userId));
  return results;
} 