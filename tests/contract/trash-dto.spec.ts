import { describe, it, expect } from 'vitest';
import {
  TrashItemSchema,
  TrashListResponseSchema,
  TrashRestoreRequestSchema,
  TrashRestoreResultSchema,
  RestoreConflictSchema,
} from '@pah/contracts';

describe('Contract Tests - Trash DTO', () => {
  it('should validate TrashItem', () => {
    const item = {
      trashId: 'trash_001',
      entityType: 'prompt',
      entityId: '223e4567-e89b-12d3-a456-426614174000',
      titleSnapshot: 'My Prompt',
      deletedAt: '2024-01-01T00:00:00.000Z',
      purgeAfter: '2024-02-01T00:00:00.000Z',
      originalRelativePath: 'projects/demo/prompts/my-prompt.md',
      attachmentsMoved: true,
    };

    expect(TrashItemSchema.safeParse(item).success).toBe(true);
  });

  it('should validate TrashListResponse', () => {
    const response = {
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
      hasMore: false,
    };

    expect(TrashListResponseSchema.safeParse(response).success).toBe(true);
  });

  it('should validate TrashRestoreRequest', () => {
    expect(TrashRestoreRequestSchema.safeParse({ strategy: 'overwrite' }).success).toBe(true);
    expect(TrashRestoreRequestSchema.safeParse({ strategy: 'rename', newSlug: 'new-slug' }).success).toBe(true);
    expect(TrashRestoreRequestSchema.safeParse({ strategy: 'rename' }).success).toBe(true);
  });

  it('should validate TrashRestoreResult', () => {
    expect(TrashRestoreResultSchema.safeParse({ restored: true }).success).toBe(true);
    expect(
      TrashRestoreResultSchema.safeParse({
        restored: true,
        entityType: 'prompt',
        entityId: '223e4567-e89b-12d3-a456-426614174000',
        restoredRelativePath: 'projects/demo/prompts/my-prompt.md',
      }).success,
    ).toBe(true);
  });

  it('should validate RestoreConflict', () => {
    const conflict = {
      code: 'RESTORE_CONFLICT',
      message: 'Target exists',
      conflicts: [{ kind: 'entityPath', path: 'projects/demo/prompts/my-prompt.md' }],
    };

    expect(RestoreConflictSchema.safeParse(conflict).success).toBe(true);
  });
});
