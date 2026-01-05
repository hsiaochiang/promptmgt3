import { describe, it, expect } from 'vitest';
import {
  FileChangedPayloadSchema,
  EntityUpdatedPayloadSchema,
  SyncStatusPayloadSchema,
  SnapshotCreatedPayloadSchema,
  SnapshotFailedPayloadSchema,
} from '@pah/contracts';

describe('Contract Tests - WebSocket Payload Schemas', () => {
  describe('FileChangedPayloadSchema', () => {
    it('should validate file.changed event with all fields', () => {
      const validEvent = {
        event: 'file.changed',
        data: {
          path: '/projects/test/project.md',
          entityType: 'project' as const,
          entityId: '123e4567-e89b-12d3-a456-426614174000',
          changeType: 'modify' as const,
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      
      const result = FileChangedPayloadSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should validate all changeTypes', () => {
      const changeTypes = ['add', 'modify', 'delete', 'move'] as const;
      changeTypes.forEach(changeType => {
        const event = {
          event: 'file.changed',
          data: {
            path: '/test/path',
            changeType,
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        };
        
        const result = FileChangedPayloadSchema.safeParse(event);
        expect(result.success).toBe(true);
      });
    });

    it('should validate move operation with oldPath', () => {
      const moveEvent = {
        event: 'file.changed',
        data: {
          path: '/new/path',
          changeType: 'move' as const,
          timestamp: '2024-01-01T00:00:00.000Z',
          oldPath: '/old/path',
        },
      };
      
      const result = FileChangedPayloadSchema.safeParse(moveEvent);
      expect(result.success).toBe(true);
    });

    it('should fail with wrong event name', () => {
      const invalid = {
        event: 'file.updated',
        data: {
          path: '/test/path',
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      
      const result = FileChangedPayloadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid changeType', () => {
      const invalid = {
        event: 'file.changed',
        data: {
          path: '/test/path',
          changeType: 'invalid',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      
      const result = FileChangedPayloadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('EntityUpdatedPayloadSchema', () => {
    it('should validate entity.updated event', () => {
      const validEvent = {
        event: 'entity.updated',
        data: {
          entityType: 'prompt' as const,
          id: '123e4567-e89b-12d3-a456-426614174000',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };
      
      const result = EntityUpdatedPayloadSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should validate all entityTypes', () => {
      const entityTypes = ['project', 'prompt', 'inbox'] as const;
      entityTypes.forEach(entityType => {
        const event = {
          event: 'entity.updated',
          data: {
            entityType,
            id: '123e4567-e89b-12d3-a456-426614174000',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        };
        
        const result = EntityUpdatedPayloadSchema.safeParse(event);
        expect(result.success).toBe(true);
      });
    });

    it('should fail with wrong event name', () => {
      const invalid = {
        event: 'entity.changed',
        data: {
          entityType: 'prompt',
          id: '123e4567-e89b-12d3-a456-426614174000',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };
      
      const result = EntityUpdatedPayloadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('SyncStatusPayloadSchema', () => {
    it('should validate sync.status event with all statuses', () => {
      const statuses = ['idle', 'saving', 'conflict', 'error'] as const;
      statuses.forEach(status => {
        const event = {
          event: 'sync.status',
          data: {
            status,
          },
        };
        
        const result = SyncStatusPayloadSchema.safeParse(event);
        expect(result.success).toBe(true);
      });
    });

    it('should validate with entity context', () => {
      const event = {
        event: 'sync.status',
        data: {
          status: 'saving' as const,
          entityType: 'prompt' as const,
          id: '123e4567-e89b-12d3-a456-426614174000',
          message: 'Saving prompt...',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };
      
      const result = SyncStatusPayloadSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('should fail with wrong event name', () => {
      const invalid = {
        event: 'status.sync',
        data: {
          status: 'idle',
        },
      };
      
      const result = SyncStatusPayloadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid status', () => {
      const invalid = {
        event: 'sync.status',
        data: {
          status: 'unknown',
        },
      };
      
      const result = SyncStatusPayloadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('SnapshotCreatedPayloadSchema', () => {
    it('should validate snapshot.created event', () => {
      const validEvent = {
        event: 'snapshot.created',
        data: {
          snapshotId: '20240101-000000',
          scope: 'workspace' as const,
          path: '/snapshots/20240101-000000',
          stats: {
            filesCount: 100,
            attachmentsCount: 25,
            sizeBytes: 1048576,
          },
        },
      };
      
      const result = SnapshotCreatedPayloadSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should validate all scope types', () => {
      const scopes = ['workspace', 'project', 'prompt'] as const;
      scopes.forEach(scope => {
        const event = {
          event: 'snapshot.created',
          data: {
            snapshotId: 'test-snapshot',
            scope,
            path: '/snapshots/test',
            stats: {
              filesCount: 10,
              attachmentsCount: 5,
              sizeBytes: 1024,
            },
          },
        };
        
        const result = SnapshotCreatedPayloadSchema.safeParse(event);
        expect(result.success).toBe(true);
      });
    });

    it('should fail with negative stats', () => {
      const invalid = {
        event: 'snapshot.created',
        data: {
          snapshotId: 'test',
          scope: 'workspace',
          path: '/test',
          stats: {
            filesCount: -1,
            attachmentsCount: 0,
            sizeBytes: 0,
          },
        },
      };
      
      const result = SnapshotCreatedPayloadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('SnapshotFailedPayloadSchema', () => {
    it('should validate snapshot.failed event', () => {
      const validEvent = {
        event: 'snapshot.failed',
        data: {
          snapshotId: 'failed-snapshot',
          scope: 'project' as const,
          error: 'Insufficient disk space',
        },
      };
      
      const result = SnapshotFailedPayloadSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should fail with wrong event name', () => {
      const invalid = {
        event: 'snapshot.error',
        data: {
          snapshotId: 'test',
          scope: 'project',
          error: 'test error',
        },
      };
      
      const result = SnapshotFailedPayloadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
