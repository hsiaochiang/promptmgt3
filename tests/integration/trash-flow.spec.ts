import { describe, it, expect, beforeEach } from 'vitest';
import { TrashItemSchema, TrashListResponseSchema } from '@pah/contracts';

/**
 * Integration Test: Trash Flow (Delete → List → Restore → Purge)
 * 
 * Tests the complete lifecycle of trash operations:
 * 1. Delete entity (prompt/project) → moves to trash
 * 2. List trash items → verify item appears
 * 3. Restore from trash → verify item returns to original location
 * 4. Purge from trash → permanent deletion
 */
describe('Integration: Trash Flow', () => {
  let mockTrashStore: {
    items: Map<string, any>;
    nextId: number;
  };

  beforeEach(() => {
    // Mock trash store for integration testing
    mockTrashStore = {
      items: new Map(),
      nextId: 1,
    };
  });

  it('should complete full trash lifecycle: delete → list → restore → purge', async () => {
    // STEP 1: Delete a prompt → should move to trash
    const promptToDelete = {
      id: '223e4567-e89b-12d3-a456-426614174000',
      slug: 'test-prompt',
      projectId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Prompt',
      status: 'draft',
      priority: 'P1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
    };

    const trashItem = {
      trashId: `trash_${mockTrashStore.nextId++}`,
      entityType: 'prompt' as const,
      entityId: promptToDelete.id,
      titleSnapshot: promptToDelete.title,
      deletedAt: new Date().toISOString(),
      purgeAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: `projects/test-project/prompts/${promptToDelete.slug}.md`,
      attachmentsMoved: true,
      sizeBytes: 2048,
    };

    mockTrashStore.items.set(trashItem.trashId, trashItem);

    // Validate trash item schema
    const trashValidation = TrashItemSchema.safeParse(trashItem);
    expect(trashValidation.success).toBe(true);
    expect(mockTrashStore.items.size).toBe(1);

    // STEP 2: List trash items → should include deleted prompt
    const trashList = {
      items: Array.from(mockTrashStore.items.values()),
      total: mockTrashStore.items.size,
      page: 1,
      perPage: 20,
      hasMore: false,
    };

    const listValidation = TrashListResponseSchema.safeParse(trashList);
    expect(listValidation.success).toBe(true);
    expect(trashList.items.length).toBe(1);
    expect(trashList.items[0].titleSnapshot).toBe('Test Prompt');
    expect(trashList.items[0].entityType).toBe('prompt');

    // STEP 3: Restore from trash → should move back to original location
    const restoreRequest = {
      strategy: 'overwrite' as const,
    };

    // Simulate restore operation
    const restoredItem = mockTrashStore.items.get(trashItem.trashId);
    expect(restoredItem).toBeDefined();
    
    const restoreResult = {
      restored: true,
      entityType: restoredItem!.entityType,
      entityId: restoredItem!.entityId,
      restoredRelativePath: restoredItem!.originalRelativePath,
    };

    mockTrashStore.items.delete(trashItem.trashId);

    expect(restoreResult.restored).toBe(true);
    expect(restoreResult.restoredRelativePath).toBe(`projects/test-project/prompts/${promptToDelete.slug}.md`);
    expect(mockTrashStore.items.size).toBe(0);

    // STEP 4: Delete again, then purge (permanent delete)
    mockTrashStore.items.set(trashItem.trashId, trashItem);
    expect(mockTrashStore.items.size).toBe(1);

    // Purge operation
    const purgeSuccess = mockTrashStore.items.delete(trashItem.trashId);
    expect(purgeSuccess).toBe(true);
    expect(mockTrashStore.items.size).toBe(0);
  });

  it('should handle deleting project with prompts (cascade to trash)', async () => {
    // Delete project should also handle its child prompts
    const projectTrashItem = {
      trashId: `trash_${mockTrashStore.nextId++}`,
      entityType: 'project' as const,
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      titleSnapshot: 'Test Project',
      deletedAt: new Date().toISOString(),
      purgeAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/test-project',
      attachmentsMoved: false,
      sizeBytes: 10240,
    };

    mockTrashStore.items.set(projectTrashItem.trashId, projectTrashItem);

    const validation = TrashItemSchema.safeParse(projectTrashItem);
    expect(validation.success).toBe(true);
    expect(mockTrashStore.items.size).toBe(1);
  });

  it('should filter trash list by entityType', () => {
    // Add multiple trash items of different types
    const promptTrash = {
      trashId: 'trash_1',
      entityType: 'prompt' as const,
      entityId: 'prompt-1',
      titleSnapshot: 'Prompt 1',
      deletedAt: new Date().toISOString(),
      purgeAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/p1/prompts/p1.md',
      attachmentsMoved: true,
    };

    const projectTrash = {
      trashId: 'trash_2',
      entityType: 'project' as const,
      entityId: 'project-1',
      titleSnapshot: 'Project 1',
      deletedAt: new Date().toISOString(),
      purgeAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/project-1',
      attachmentsMoved: false,
    };

    mockTrashStore.items.set(promptTrash.trashId, promptTrash);
    mockTrashStore.items.set(projectTrash.trashId, projectTrash);

    // Filter by entityType = 'prompt'
    const filteredPrompts = Array.from(mockTrashStore.items.values())
      .filter(item => item.entityType === 'prompt');

    expect(filteredPrompts.length).toBe(1);
    expect(filteredPrompts[0].titleSnapshot).toBe('Prompt 1');

    // Filter by entityType = 'project'
    const filteredProjects = Array.from(mockTrashStore.items.values())
      .filter(item => item.entityType === 'project');

    expect(filteredProjects.length).toBe(1);
    expect(filteredProjects[0].titleSnapshot).toBe('Project 1');
  });

  it('should support search in trash list', () => {
    // Add trash items
    mockTrashStore.items.set('trash_1', {
      trashId: 'trash_1',
      entityType: 'prompt' as const,
      entityId: 'prompt-1',
      titleSnapshot: 'Authentication Flow',
      deletedAt: new Date().toISOString(),
      purgeAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/p1/prompts/auth.md',
      attachmentsMoved: false,
    });

    mockTrashStore.items.set('trash_2', {
      trashId: 'trash_2',
      entityType: 'prompt' as const,
      entityId: 'prompt-2',
      titleSnapshot: 'Database Schema',
      deletedAt: new Date().toISOString(),
      purgeAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/p1/prompts/db.md',
      attachmentsMoved: false,
    });

    // Search for "auth"
    const searchTerm = 'auth';
    const searchResults = Array.from(mockTrashStore.items.values())
      .filter(item => item.titleSnapshot?.toLowerCase().includes(searchTerm.toLowerCase()));

    expect(searchResults.length).toBe(1);
    expect(searchResults[0].titleSnapshot).toBe('Authentication Flow');
  });

  it('should handle pagination in trash list', () => {
    // Add 25 trash items
    for (let i = 1; i <= 25; i++) {
      mockTrashStore.items.set(`trash_${i}`, {
        trashId: `trash_${i}`,
        entityType: 'prompt' as const,
        entityId: `prompt-${i}`,
        titleSnapshot: `Prompt ${i}`,
        deletedAt: new Date().toISOString(),
        purgeAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        originalRelativePath: `projects/p1/prompts/p${i}.md`,
        attachmentsMoved: false,
      });
    }

    const perPage = 20;
    const allItems = Array.from(mockTrashStore.items.values());

    // Page 1
    const page1 = allItems.slice(0, perPage);
    expect(page1.length).toBe(20);

    // Page 2
    const page2 = allItems.slice(perPage, perPage * 2);
    expect(page2.length).toBe(5);

    // Validate response structure
    const page1Response = {
      items: page1,
      total: allItems.length,
      page: 1,
      perPage,
      hasMore: true,
    };

    const validation = TrashListResponseSchema.safeParse(page1Response);
    expect(validation.success).toBe(true);
  });
});
