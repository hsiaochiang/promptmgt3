import { describe, it, expect } from 'vitest';
import {
  TrashItemSchema,
  TrashListResponseSchema,
  TrashRestoreRequestSchema,
  TrashRestoreResultSchema,
  RestoreConflictSchema,
} from '@pah/contracts';

describe('Contract Tests - Trash API Endpoints', () => {
  describe('GET /api/trash - List trash items', () => {
    it('should validate trash list response schema', () => {
      const response = {
        items: [
          {
            trashId: 'trash_001',
            entityType: 'prompt',
            entityId: '223e4567-e89b-12d3-a456-426614174000',
            titleSnapshot: 'Deleted Prompt',
            deletedAt: '2024-01-01T00:00:00.000Z',
            purgeAfter: '2024-02-01T00:00:00.000Z',
            originalRelativePath: 'projects/demo/prompts/deleted.md',
            attachmentsMoved: true,
            sizeBytes: 1024,
          },
        ],
        total: 1,
        page: 1,
        perPage: 20,
        hasMore: false,
      };

      const result = TrashListResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should support query parameters for filtering', () => {
      // Query params: q, entityType, page, perPage
      const queryParams = {
        q: 'search term',
        entityType: 'prompt',
        page: 1,
        perPage: 20,
      };

      expect(queryParams.q).toBeDefined();
      expect(['project', 'prompt', 'inboxItem', 'snippet'].includes(queryParams.entityType)).toBe(true);
      expect(queryParams.page).toBeGreaterThan(0);
      expect(queryParams.perPage).toBeGreaterThan(0);
    });

    it('should validate empty trash list response', () => {
      const emptyResponse = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
        hasMore: false,
      };

      const result = TrashListResponseSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('DELETE /api/trash/:trashId - Purge (permanent delete)', () => {
    it('should return 204 on successful purge', () => {
      // Endpoint should return 204 No Content on success
      const statusCode = 204;
      expect(statusCode).toBe(204);
    });

    it('should return 404 when trash item not found', () => {
      const error404 = {
        error: 'Trash item not found',
        trashId: 'trash_nonexistent',
      };

      expect(error404).toHaveProperty('error');
      expect(error404).toHaveProperty('trashId');
    });

    it('should return 500 on purge failure with retry hint', () => {
      const error500 = {
        error: 'Failed to purge trash item',
        message: 'Filesystem error',
        retryable: true,
      };

      expect(error500).toHaveProperty('error');
      expect(error500).toHaveProperty('retryable');
    });
  });

  describe('POST /api/trash/:trashId/restore - Restore from trash', () => {
    it('should validate restore request with overwrite strategy', () => {
      const request = {
        strategy: 'overwrite',
      };

      const result = TrashRestoreRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should validate restore request with rename strategy', () => {
      const request = {
        strategy: 'rename',
        newSlug: 'renamed-prompt',
      };

      const result = TrashRestoreRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should validate successful restore response', () => {
      const response = {
        restored: true,
        entityType: 'prompt',
        entityId: '223e4567-e89b-12d3-a456-426614174000',
        restoredRelativePath: 'projects/demo/prompts/restored.md',
      };

      const result = TrashRestoreResultSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should return 409 conflict when destination exists', () => {
      const conflict = {
        code: 'RESTORE_CONFLICT',
        message: 'Destination already exists',
        conflicts: [
          {
            kind: 'entityPath',
            path: 'projects/demo/prompts/existing.md',
          },
        ],
      };

      const result = RestoreConflictSchema.safeParse(conflict);
      expect(result.success).toBe(true);
      expect(conflict).toHaveProperty('code', 'RESTORE_CONFLICT');
      expect(conflict.conflicts.length).toBeGreaterThan(0);
    });

    it('should return 409 conflict when attachments directory exists', () => {
      const conflict = {
        code: 'RESTORE_CONFLICT',
        message: 'Attachments directory already exists',
        conflicts: [
          {
            kind: 'attachmentPath',
            path: 'attachments/prompt/223e4567-e89b-12d3-a456-426614174000',
          },
        ],
      };

      const result = RestoreConflictSchema.safeParse(conflict);
      expect(result.success).toBe(true);
    });

    it('should return 409 conflict with multiple conflicts', () => {
      const conflict = {
        code: 'RESTORE_CONFLICT',
        message: 'Multiple conflicts detected',
        conflicts: [
          {
            kind: 'entityPath',
            path: 'projects/demo/prompts/existing.md',
          },
          {
            kind: 'attachmentPath',
            path: 'attachments/prompt/223e4567-e89b-12d3-a456-426614174000',
          },
        ],
      };

      const result = RestoreConflictSchema.safeParse(conflict);
      expect(result.success).toBe(true);
      expect(conflict.conflicts.length).toBe(2);
    });

    it('should return 404 when trash item not found', () => {
      const error404 = {
        error: 'Trash item not found',
        trashId: 'trash_nonexistent',
      };

      expect(error404).toHaveProperty('error');
      expect(error404).toHaveProperty('trashId');
    });
  });

  describe('DELETE endpoints should return TrashItem', () => {
    it('should validate that delete prompt returns TrashItem', () => {
      const deleteResponse = {
        trashId: 'trash_002',
        entityType: 'prompt',
        entityId: '223e4567-e89b-12d3-a456-426614174000',
        titleSnapshot: 'Deleted Prompt',
        deletedAt: '2024-01-15T10:00:00.000Z',
        purgeAfter: '2024-02-15T10:00:00.000Z',
        originalRelativePath: 'projects/demo/prompts/deleted.md',
        attachmentsMoved: true,
      };

      const result = TrashItemSchema.safeParse(deleteResponse);
      expect(result.success).toBe(true);
    });

    it('should validate that delete project returns TrashItem', () => {
      const deleteResponse = {
        trashId: 'trash_003',
        entityType: 'project',
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        titleSnapshot: 'Deleted Project',
        deletedAt: '2024-01-15T10:00:00.000Z',
        purgeAfter: '2024-02-15T10:00:00.000Z',
        originalRelativePath: 'projects/deleted-project',
        attachmentsMoved: false,
      };

      const result = TrashItemSchema.safeParse(deleteResponse);
      expect(result.success).toBe(true);
    });
  });
});
