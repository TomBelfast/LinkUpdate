import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { videos } from '@/lib/db/schema/todo';
import { eq } from 'drizzle-orm';
import { createProjectMetadata, createTaskMetadata, createIdeaMetadata } from '@/lib/db/schema/todo';

describe('Todo Module', () => {
  const testUserId = 'test-user-id';

  describe('Projects', () => {
    it('should create a project using videos table', async () => {
      const projectMetadata = createProjectMetadata({
        name: 'Test Project',
        description: 'Test Description',
        status: 'ACTIVE',
        priority: 'HIGH'
      });

      const result = await db.insert(videos).values({
        user_id: testUserId,
        request_id: 'project-1',
        prompt: JSON.stringify(projectMetadata),
        duration: 0,
        aspect_ratio: '16:9',
        resolution: '1920x1080',
        model: 'project',
        created_at: new Date()
      });

      expect(result).toBeDefined();
    });

    it('should list all projects for a user', async () => {
      const projects = await db.select().from(videos)
        .where(eq(videos.userId, testUserId))
        .where(eq(videos.model, 'project'));

      expect(projects).toBeInstanceOf(Array);
      expect(projects.length).toBeGreaterThan(0);
    });
  });

  describe('Tasks', () => {
    it('should create a task using videos table', async () => {
      const taskMetadata = createTaskMetadata({
        description: 'Test Task',
        status: 'NEW',
        projectId: 'project-1'
      });

      const result = await db.insert(videos).values({
        user_id: testUserId,
        request_id: 'task-1',
        prompt: JSON.stringify(taskMetadata),
        duration: 0,
        aspect_ratio: '16:9',
        resolution: '1920x1080',
        model: 'task',
        created_at: new Date()
      });

      expect(result).toBeDefined();
    });

    it('should list all tasks for a project', async () => {
      const tasks = await db.select().from(videos)
        .where(eq(videos.userId, testUserId))
        .where(eq(videos.model, 'task'));

      expect(tasks).toBeInstanceOf(Array);
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe('Ideas', () => {
    it('should create an idea using videos table', async () => {
      const ideaMetadata = createIdeaMetadata({
        title: 'Test Idea',
        description: 'Test Description',
        status: 'DRAFT',
        tags: ['test', 'idea']
      });

      const result = await db.insert(videos).values({
        user_id: testUserId,
        request_id: 'idea-1',
        prompt: JSON.stringify(ideaMetadata),
        duration: 0,
        aspect_ratio: '16:9',
        resolution: '1920x1080',
        model: 'idea',
        created_at: new Date()
      });

      expect(result).toBeDefined();
    });

    it('should list all ideas for a user', async () => {
      const ideas = await db.select().from(videos)
        .where(eq(videos.userId, testUserId))
        .where(eq(videos.model, 'idea'));

      expect(ideas).toBeInstanceOf(Array);
      expect(ideas.length).toBeGreaterThan(0);
    });
  });
}); 