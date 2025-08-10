import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db';
import { projects, tasks, ideas, resources, widgetConfigurations } from '@/db/schema/todo';
import { v4 as uuidv4 } from 'uuid';

describe('TODO System - CRUD Operations', () => {
  const testUserId = 'test-user-' + uuidv4();

  // Test data
  const testProject = {
    id: uuidv4(),
    name: 'Test Project',
    description: 'Test Description',
    status: 'ACTIVE' as const,
    priority: 'MEDIUM' as const,
    color: '#FF0000',
    icon: 'test-icon',
    userId: testUserId,
  };

  const testTask = {
    id: uuidv4(),
    description: 'Test Task',
    status: 'NEW' as const,
    projectId: testProject.id,
    userId: testUserId,
  };

  const testIdea = {
    id: uuidv4(),
    title: 'Test Idea',
    description: 'Test Idea Description',
    status: 'DRAFT' as const,
    tags: JSON.stringify(['test', 'idea']),
    userId: testUserId,
  };

  const testResource = {
    id: uuidv4(),
    url: 'https://test.com',
    title: 'Test Resource',
    description: 'Test Resource Description',
    type: 'ARTICLE' as const,
    projectId: testProject.id,
    userId: testUserId,
  };

  const testWidget = {
    id: uuidv4(),
    widgetType: 'TEST_WIDGET',
    configuration: JSON.stringify({ test: true }),
    position: 1,
    userId: testUserId,
  };

  // Tests for Projects
  describe('Projects', () => {
    it('should create a project', async () => {
      const result = await db.insert(projects).values(testProject);
      expect(result.rowsAffected).toBe(1);
    });

    it('should read a project', async () => {
      const result = await db.select().from(projects).where({ id: testProject.id });
      expect(result[0]).toMatchObject(testProject);
    });

    it('should update a project', async () => {
      const updatedName = 'Updated Project';
      await db.update(projects)
        .set({ name: updatedName })
        .where({ id: testProject.id });
      
      const result = await db.select().from(projects).where({ id: testProject.id });
      expect(result[0].name).toBe(updatedName);
    });
  });

  // Tests for Tasks
  describe('Tasks', () => {
    it('should create a task', async () => {
      const result = await db.insert(tasks).values(testTask);
      expect(result.rowsAffected).toBe(1);
    });

    it('should read a task', async () => {
      const result = await db.select().from(tasks).where({ id: testTask.id });
      expect(result[0]).toMatchObject(testTask);
    });

    it('should update a task', async () => {
      const updatedStatus = 'IN_PROGRESS' as const;
      await db.update(tasks)
        .set({ status: updatedStatus })
        .where({ id: testTask.id });
      
      const result = await db.select().from(tasks).where({ id: testTask.id });
      expect(result[0].status).toBe(updatedStatus);
    });
  });

  // Tests for Ideas
  describe('Ideas', () => {
    it('should create an idea', async () => {
      const result = await db.insert(ideas).values(testIdea);
      expect(result.rowsAffected).toBe(1);
    });

    it('should read an idea', async () => {
      const result = await db.select().from(ideas).where({ id: testIdea.id });
      expect(result[0]).toMatchObject(testIdea);
    });

    it('should update an idea', async () => {
      const updatedTitle = 'Updated Idea';
      await db.update(ideas)
        .set({ title: updatedTitle })
        .where({ id: testIdea.id });
      
      const result = await db.select().from(ideas).where({ id: testIdea.id });
      expect(result[0].title).toBe(updatedTitle);
    });
  });

  // Tests for Resources
  describe('Resources', () => {
    it('should create a resource', async () => {
      const result = await db.insert(resources).values(testResource);
      expect(result.rowsAffected).toBe(1);
    });

    it('should read a resource', async () => {
      const result = await db.select().from(resources).where({ id: testResource.id });
      expect(result[0]).toMatchObject(testResource);
    });

    it('should update a resource', async () => {
      const updatedTitle = 'Updated Resource';
      await db.update(resources)
        .set({ title: updatedTitle })
        .where({ id: testResource.id });
      
      const result = await db.select().from(resources).where({ id: testResource.id });
      expect(result[0].title).toBe(updatedTitle);
    });
  });

  // Tests for Widget Configurations
  describe('Widget Configurations', () => {
    it('should create a widget configuration', async () => {
      const result = await db.insert(widgetConfigurations).values(testWidget);
      expect(result.rowsAffected).toBe(1);
    });

    it('should read a widget configuration', async () => {
      const result = await db.select().from(widgetConfigurations).where({ id: testWidget.id });
      expect(result[0]).toMatchObject(testWidget);
    });

    it('should update a widget configuration', async () => {
      const updatedPosition = 2;
      await db.update(widgetConfigurations)
        .set({ position: updatedPosition })
        .where({ id: testWidget.id });
      
      const result = await db.select().from(widgetConfigurations).where({ id: testWidget.id });
      expect(result[0].position).toBe(updatedPosition);
    });
  });

  // Cleanup
  afterAll(async () => {
    await db.delete(tasks).where({ userId: testUserId });
    await db.delete(resources).where({ userId: testUserId });
    await db.delete(projects).where({ userId: testUserId });
    await db.delete(ideas).where({ userId: testUserId });
    await db.delete(widgetConfigurations).where({ userId: testUserId });
  });
}); 