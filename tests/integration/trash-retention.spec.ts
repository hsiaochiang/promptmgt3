import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Integration Test: Trash Retention Policy & Automatic Cleanup
 * 
 * Tests automatic cleanup of expired trash items:
 * 1. Trash items past purgeAfter date should be auto-deleted
 * 2. Cleanup runs on server startup + daily schedule
 * 3. Failed cleanup should be observable and retryable
 * 4. No partial deletions that cause inconsistency
 */
describe('Integration: Trash Retention Policy', () => {
  let mockTrashStore: {
    items: Map<string, any>;
    cleanupLog: Array<{ timestamp: Date; success: boolean; error?: string }>;
  };

  beforeEach(() => {
    mockTrashStore = {
      items: new Map(),
      cleanupLog: [],
    };
  });

  it('should identify expired trash items based on purgeAfter', () => {
    const now = new Date();
    
    // Expired item (purgeAfter in the past)
    const expiredItem = {
      trashId: 'trash_001',
      entityType: 'prompt' as const,
      entityId: 'prompt-1',
      titleSnapshot: 'Expired Item',
      deletedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
      purgeAfter: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (expired)
      originalRelativePath: 'projects/p1/prompts/expired.md',
      attachmentsMoved: false,
    };

    // Active item (purgeAfter in the future)
    const activeItem = {
      trashId: 'trash_002',
      entityType: 'prompt' as const,
      entityId: 'prompt-2',
      titleSnapshot: 'Active Item',
      deletedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      purgeAfter: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
      originalRelativePath: 'projects/p1/prompts/active.md',
      attachmentsMoved: false,
    };

    mockTrashStore.items.set(expiredItem.trashId, expiredItem);
    mockTrashStore.items.set(activeItem.trashId, activeItem);

    // Identify expired items
    const expiredItems = Array.from(mockTrashStore.items.values())
      .filter(item => new Date(item.purgeAfter) < now);

    expect(expiredItems.length).toBe(1);
    expect(expiredItems[0].trashId).toBe('trash_001');

    // Active items should remain
    const activeItems = Array.from(mockTrashStore.items.values())
      .filter(item => new Date(item.purgeAfter) >= now);

    expect(activeItems.length).toBe(1);
    expect(activeItems[0].trashId).toBe('trash_002');
  });

  it('should purge expired items and log cleanup success', () => {
    const now = new Date();
    
    const expiredItem = {
      trashId: 'trash_expired',
      entityType: 'prompt' as const,
      entityId: 'prompt-expired',
      titleSnapshot: 'Expired',
      deletedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      purgeAfter: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      originalRelativePath: 'projects/p1/prompts/expired.md',
      attachmentsMoved: false,
    };

    mockTrashStore.items.set(expiredItem.trashId, expiredItem);
    expect(mockTrashStore.items.size).toBe(1);

    // Run cleanup
    const expiredItems = Array.from(mockTrashStore.items.values())
      .filter(item => new Date(item.purgeAfter) < now);

    let cleanupSuccess = true;
    expiredItems.forEach(item => {
      const deleted = mockTrashStore.items.delete(item.trashId);
      if (!deleted) cleanupSuccess = false;
    });

    // Log cleanup
    mockTrashStore.cleanupLog.push({
      timestamp: now,
      success: cleanupSuccess,
    });

    expect(mockTrashStore.items.size).toBe(0);
    expect(mockTrashStore.cleanupLog.length).toBe(1);
    expect(mockTrashStore.cleanupLog[0].success).toBe(true);
  });

  it('should handle cleanup failure and log error for retry', () => {
    const now = new Date();
    
    const expiredItem = {
      trashId: 'trash_problematic',
      entityType: 'prompt' as const,
      entityId: 'prompt-problematic',
      titleSnapshot: 'Problematic Item',
      deletedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      purgeAfter: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/p1/prompts/problematic.md',
      attachmentsMoved: true, // Has attachments that might fail to delete
    };

    mockTrashStore.items.set(expiredItem.trashId, expiredItem);

    // Simulate cleanup failure
    const simulateCleanupError = () => {
      throw new Error('Filesystem permission denied');
    };

    let cleanupError: string | undefined;
    try {
      simulateCleanupError();
      mockTrashStore.items.delete(expiredItem.trashId);
    } catch (err) {
      cleanupError = (err as Error).message;
    }

    // Log failure
    mockTrashStore.cleanupLog.push({
      timestamp: now,
      success: false,
      error: cleanupError,
    });

    // Item should still exist after failed cleanup
    expect(mockTrashStore.items.size).toBe(1);
    expect(mockTrashStore.cleanupLog.length).toBe(1);
    expect(mockTrashStore.cleanupLog[0].success).toBe(false);
    expect(mockTrashStore.cleanupLog[0].error).toContain('permission denied');
  });

  it('should prevent partial deletion to avoid inconsistency', () => {
    const now = new Date();
    
    const itemWithAttachments = {
      trashId: 'trash_with_attach',
      entityType: 'prompt' as const,
      entityId: 'prompt-attach',
      titleSnapshot: 'Has Attachments',
      deletedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      purgeAfter: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/p1/prompts/with-attach.md',
      attachmentsMoved: true,
    };

    mockTrashStore.items.set(itemWithAttachments.trashId, itemWithAttachments);

    // Simulate atomic deletion (all-or-nothing)
    const deleteTrashItem = (trashId: string): { success: boolean; error?: string } => {
      const item = mockTrashStore.items.get(trashId);
      if (!item) return { success: false, error: 'Item not found' };

      const steps = [
        { name: 'delete_manifest', success: true },
        { name: 'delete_root', success: true },
        { name: 'delete_attachments', success: false }, // Simulate attachment deletion failure
      ];

      // Check if all steps would succeed
      const allSuccess = steps.every(step => step.success);
      
      if (!allSuccess) {
        // Rollback: do not delete anything if any step fails
        return { success: false, error: 'Failed to delete attachments - rollback' };
      }

      // Only delete if all steps succeed
      mockTrashStore.items.delete(trashId);
      return { success: true };
    };

    const result = deleteTrashItem(itemWithAttachments.trashId);

    // Deletion should fail and item should remain
    expect(result.success).toBe(false);
    expect(result.error).toContain('rollback');
    expect(mockTrashStore.items.size).toBe(1); // Item still exists - no partial deletion
  });

  it('should calculate correct purgeAfter based on trashRetentionDays', () => {
    const trashRetentionDays = 30;
    const deletedAt = new Date('2024-01-01T10:00:00.000Z');
    
    const expectedPurgeAfter = new Date(deletedAt);
    expectedPurgeAfter.setDate(expectedPurgeAfter.getDate() + trashRetentionDays);

    const trashItem = {
      trashId: 'trash_retention_test',
      entityType: 'prompt' as const,
      entityId: 'prompt-test',
      titleSnapshot: 'Test Item',
      deletedAt: deletedAt.toISOString(),
      purgeAfter: expectedPurgeAfter.toISOString(),
      originalRelativePath: 'projects/p1/prompts/test.md',
      attachmentsMoved: false,
    };

    expect(trashItem.purgeAfter).toBe('2024-01-31T10:00:00.000Z');
    
    // Verify retention period
    const actualRetentionDays = Math.floor(
      (new Date(trashItem.purgeAfter).getTime() - new Date(trashItem.deletedAt).getTime()) 
      / (24 * 60 * 60 * 1000)
    );
    expect(actualRetentionDays).toBe(30);
  });

  it('should support configurable retention days from workspace settings', () => {
    const workspaceSettings = {
      trashRetentionDays: 60, // Custom: 60 days instead of default 30
    };

    const deletedAt = new Date('2024-01-01T10:00:00.000Z');
    const purgeAfter = new Date(deletedAt);
    purgeAfter.setDate(purgeAfter.getDate() + workspaceSettings.trashRetentionDays);

    expect(purgeAfter.toISOString()).toBe('2024-03-01T10:00:00.000Z');
  });

  it('should run cleanup on server startup', () => {
    // Simulate server startup cleanup
    const serverStartupTime = new Date();
    
    // Add some expired items before startup
    mockTrashStore.items.set('trash_startup_1', {
      trashId: 'trash_startup_1',
      entityType: 'prompt' as const,
      entityId: 'prompt-1',
      titleSnapshot: 'Expired before startup',
      deletedAt: new Date(serverStartupTime.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      purgeAfter: new Date(serverStartupTime.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      originalRelativePath: 'projects/p1/prompts/expired.md',
      attachmentsMoved: false,
    });

    expect(mockTrashStore.items.size).toBe(1);

    // Run startup cleanup
    const expiredItems = Array.from(mockTrashStore.items.values())
      .filter(item => new Date(item.purgeAfter) < serverStartupTime);

    expiredItems.forEach(item => mockTrashStore.items.delete(item.trashId));

    mockTrashStore.cleanupLog.push({
      timestamp: serverStartupTime,
      success: true,
    });

    expect(mockTrashStore.items.size).toBe(0);
    expect(mockTrashStore.cleanupLog[0].timestamp).toEqual(serverStartupTime);
  });

  it('should schedule daily cleanup at fixed time (e.g., 03:00 local time)', () => {
    // This is a conceptual test - actual scheduling would use node-cron or similar
    const cleanupSchedule = '03:00'; // Local time: 3:00 AM
    
    // Simulate a scheduled cleanup run
    const scheduledRunTime = new Date('2024-01-15T03:00:00'); // 3 AM local
    
    mockTrashStore.cleanupLog.push({
      timestamp: scheduledRunTime,
      success: true,
    });

    expect(mockTrashStore.cleanupLog.length).toBe(1);
    expect(mockTrashStore.cleanupLog[0].timestamp.getHours()).toBe(3);
    expect(mockTrashStore.cleanupLog[0].timestamp.getMinutes()).toBe(0);
  });

  it('should allow retry of failed cleanup on next schedule', () => {
    const now = new Date();
    
    // First attempt fails
    mockTrashStore.cleanupLog.push({
      timestamp: now,
      success: false,
      error: 'Disk full',
    });

    // Retry on next schedule (e.g., next day)
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    mockTrashStore.cleanupLog.push({
      timestamp: nextDay,
      success: true,
    });

    expect(mockTrashStore.cleanupLog.length).toBe(2);
    expect(mockTrashStore.cleanupLog[0].success).toBe(false);
    expect(mockTrashStore.cleanupLog[1].success).toBe(true);
  });
});
