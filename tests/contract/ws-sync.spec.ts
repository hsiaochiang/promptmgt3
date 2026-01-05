/**
 * T051 [P] [US2] Contract test：WS `file.changed`/`sync.status` payload
 * DoD: event name + payload schema 不一致會 fail
 */

import { describe, it, expect } from 'vitest';
import {
  FileChangedPayloadSchema,
  EntityUpdatedPayloadSchema,
} from '../../packages/contracts/src/ws/files.js';
import {
  SyncStatusPayloadSchema,
  SnapshotCreatedPayloadSchema,
  SnapshotFailedPayloadSchema,
  StatusEventSchema,
} from '../../packages/contracts/src/ws/status.js';
import type {
  FileChangedPayload,
  EntityUpdatedPayload,
} from '../../packages/contracts/src/ws/files.js';
import type {
  SyncStatusPayload,
  SnapshotCreatedPayload,
  SnapshotFailedPayload,
} from '../../packages/contracts/src/ws/status.js';

describe('Contract - WebSocket Sync Payloads', () => {
  describe('FileChangedPayload', () => {
    it('should accept valid file.changed payload with all fields', () => {
      const validPayload: FileChangedPayload = {
        event: 'file.changed',
        data: {
          path: 'projects/test-project/prompts/test.md',
          entityType: 'prompt',
          entityId: '550e8400-e29b-41d4-a716-446655440000',
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      const result = FileChangedPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should accept minimal file.changed payload', () => {
      const minimalPayload = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          changeType: 'add',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      const result = FileChangedPayloadSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.entityType).toBeUndefined();
        expect(result.data.data.entityId).toBeUndefined();
      }
    });

    it('should accept move operation with oldPath', () => {
      const movePayload = {
        event: 'file.changed',
        data: {
          path: 'projects/new-path/prompts/test.md',
          changeType: 'move',
          timestamp: '2024-01-01T00:00:00.000Z',
          oldPath: 'projects/old-path/prompts/test.md',
        },
      };

      const result = FileChangedPayloadSchema.safeParse(movePayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.oldPath).toBe('projects/old-path/prompts/test.md');
      }
    });

    it('should validate changeType enum values', () => {
      const validChangeTypes = ['add', 'modify', 'delete', 'move'] as const;

      validChangeTypes.forEach(changeType => {
        const payload = {
          event: 'file.changed',
          data: {
            path: 'test.md',
            changeType,
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        };
        expect(FileChangedPayloadSchema.safeParse(payload).success).toBe(true);
      });

      const invalidChangeType = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          changeType: 'invalid',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(invalidChangeType).success).toBe(false);
    });

    it('should validate entityType enum values', () => {
      const validEntityTypes = ['project', 'prompt', 'inbox', 'workspace'] as const;

      validEntityTypes.forEach(entityType => {
        const payload = {
          event: 'file.changed',
          data: {
            path: 'test.md',
            entityType,
            changeType: 'modify',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        };
        expect(FileChangedPayloadSchema.safeParse(payload).success).toBe(true);
      });

      const invalidEntityType = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          entityType: 'invalid',
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(invalidEntityType).success).toBe(false);
    });

    it('should reject invalid event name', () => {
      const invalidEvent = {
        event: 'wrong.event',
        data: {
          path: 'test.md',
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(invalidEvent).success).toBe(false);
    });

    it('should validate UUID format for entityId', () => {
      const validUuid = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          entityId: '550e8400-e29b-41d4-a716-446655440000',
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(validUuid).success).toBe(true);

      const invalidUuid = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          entityId: 'not-a-uuid',
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(invalidUuid).success).toBe(false);
    });

    it('should validate datetime format for timestamp', () => {
      const validTimestamp = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(validTimestamp).success).toBe(true);

      const invalidTimestamp = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          changeType: 'modify',
          timestamp: 'not-a-date',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(invalidTimestamp).success).toBe(false);
    });

    it('should require mandatory fields', () => {
      const missingPath = {
        event: 'file.changed',
        data: {
          changeType: 'modify',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(missingPath).success).toBe(false);

      const missingChangeType = {
        event: 'file.changed',
        data: {
          path: 'test.md',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(FileChangedPayloadSchema.safeParse(missingChangeType).success).toBe(false);
    });
  });

  describe('EntityUpdatedPayload', () => {
    it('should accept valid entity.updated payload', () => {
      const validPayload: EntityUpdatedPayload = {
        event: 'entity.updated',
        data: {
          entityType: 'prompt',
          id: '550e8400-e29b-41d4-a716-446655440000',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      const result = EntityUpdatedPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should validate entityType enum values', () => {
      const validEntityTypes = ['project', 'prompt', 'inbox'] as const;

      validEntityTypes.forEach(entityType => {
        const payload = {
          event: 'entity.updated',
          data: {
            entityType,
            id: '550e8400-e29b-41d4-a716-446655440000',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        };
        expect(EntityUpdatedPayloadSchema.safeParse(payload).success).toBe(true);
      });

      const invalidEntityType = {
        event: 'entity.updated',
        data: {
          entityType: 'invalid',
          id: '550e8400-e29b-41d4-a716-446655440000',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(EntityUpdatedPayloadSchema.safeParse(invalidEntityType).success).toBe(false);
    });

    it('should reject invalid event name', () => {
      const invalidEvent = {
        event: 'wrong.event',
        data: {
          entityType: 'prompt',
          id: '550e8400-e29b-41d4-a716-446655440000',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(EntityUpdatedPayloadSchema.safeParse(invalidEvent).success).toBe(false);
    });

    it('should require all mandatory fields', () => {
      const missingId = {
        event: 'entity.updated',
        data: {
          entityType: 'prompt',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };
      expect(EntityUpdatedPayloadSchema.safeParse(missingId).success).toBe(false);
    });
  });

  describe('SyncStatusPayload', () => {
    it('should accept valid sync.status payload with all fields', () => {
      const validPayload: SyncStatusPayload = {
        event: 'sync.status',
        data: {
          status: 'saving',
          entityType: 'prompt',
          id: '550e8400-e29b-41d4-a716-446655440000',
          message: 'Saving changes...',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      const result = SyncStatusPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should accept minimal sync.status payload', () => {
      const minimalPayload = {
        event: 'sync.status',
        data: {
          status: 'idle',
        },
      };

      const result = SyncStatusPayloadSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.entityType).toBeUndefined();
        expect(result.data.data.id).toBeUndefined();
        expect(result.data.data.message).toBeUndefined();
      }
    });

    it('should validate status enum values', () => {
      const validStatuses = ['idle', 'saving', 'conflict', 'error'] as const;

      validStatuses.forEach(status => {
        const payload = {
          event: 'sync.status',
          data: { status },
        };
        expect(SyncStatusPayloadSchema.safeParse(payload).success).toBe(true);
      });

      const invalidStatus = {
        event: 'sync.status',
        data: { status: 'invalid' },
      };
      expect(SyncStatusPayloadSchema.safeParse(invalidStatus).success).toBe(false);
    });

    it('should accept conflict status with entity context', () => {
      const conflictPayload = {
        event: 'sync.status',
        data: {
          status: 'conflict',
          entityType: 'prompt',
          id: '550e8400-e29b-41d4-a716-446655440000',
          message: 'External modification detected',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(SyncStatusPayloadSchema.safeParse(conflictPayload).success).toBe(true);
    });

    it('should accept error status with message', () => {
      const errorPayload = {
        event: 'sync.status',
        data: {
          status: 'error',
          message: 'Failed to save: Permission denied',
        },
      };

      const result = SyncStatusPayloadSchema.safeParse(errorPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.message).toBe('Failed to save: Permission denied');
      }
    });

    it('should reject invalid event name', () => {
      const invalidEvent = {
        event: 'wrong.event',
        data: { status: 'idle' },
      };
      expect(SyncStatusPayloadSchema.safeParse(invalidEvent).success).toBe(false);
    });
  });

  describe('SnapshotCreatedPayload', () => {
    it('should accept valid snapshot.created payload', () => {
      const validPayload: SnapshotCreatedPayload = {
        event: 'snapshot.created',
        data: {
          snapshotId: 'snapshot-20240101-120000',
          scope: 'workspace',
          path: '/path/to/snapshot',
          stats: {
            filesCount: 100,
            attachmentsCount: 25,
            sizeBytes: 1024000,
          },
        },
      };

      const result = SnapshotCreatedPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should validate scope enum values', () => {
      const validScopes = ['workspace', 'project', 'prompt'] as const;

      validScopes.forEach(scope => {
        const payload = {
          event: 'snapshot.created',
          data: {
            snapshotId: 'test-snapshot',
            scope,
            path: '/path',
            stats: {
              filesCount: 0,
              attachmentsCount: 0,
              sizeBytes: 0,
            },
          },
        };
        expect(SnapshotCreatedPayloadSchema.safeParse(payload).success).toBe(true);
      });

      const invalidScope = {
        event: 'snapshot.created',
        data: {
          snapshotId: 'test-snapshot',
          scope: 'invalid',
          path: '/path',
          stats: {
            filesCount: 0,
            attachmentsCount: 0,
            sizeBytes: 0,
          },
        },
      };
      expect(SnapshotCreatedPayloadSchema.safeParse(invalidScope).success).toBe(false);
    });

    it('should validate stats constraints', () => {
      const validStats = {
        event: 'snapshot.created',
        data: {
          snapshotId: 'test',
          scope: 'workspace' as const,
          path: '/path',
          stats: {
            filesCount: 1000,
            attachmentsCount: 500,
            sizeBytes: 5000000,
          },
        },
      };
      expect(SnapshotCreatedPayloadSchema.safeParse(validStats).success).toBe(true);

      const negativeCount = {
        event: 'snapshot.created',
        data: {
          snapshotId: 'test',
          scope: 'workspace' as const,
          path: '/path',
          stats: {
            filesCount: -1,
            attachmentsCount: 0,
            sizeBytes: 0,
          },
        },
      };
      expect(SnapshotCreatedPayloadSchema.safeParse(negativeCount).success).toBe(false);
    });

    it('should reject invalid event name', () => {
      const invalidEvent = {
        event: 'wrong.event',
        data: {
          snapshotId: 'test',
          scope: 'workspace',
          path: '/path',
          stats: {
            filesCount: 0,
            attachmentsCount: 0,
            sizeBytes: 0,
          },
        },
      };
      expect(SnapshotCreatedPayloadSchema.safeParse(invalidEvent).success).toBe(false);
    });

    it('should require all mandatory fields', () => {
      const missingStats = {
        event: 'snapshot.created',
        data: {
          snapshotId: 'test',
          scope: 'workspace',
          path: '/path',
        },
      };
      expect(SnapshotCreatedPayloadSchema.safeParse(missingStats).success).toBe(false);
    });
  });

  describe('SnapshotFailedPayload', () => {
    it('should accept valid snapshot.failed payload', () => {
      const validPayload: SnapshotFailedPayload = {
        event: 'snapshot.failed',
        data: {
          snapshotId: 'snapshot-20240101-120000',
          scope: 'workspace',
          error: 'Disk full',
        },
      };

      const result = SnapshotFailedPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should validate scope enum values', () => {
      const validScopes = ['workspace', 'project', 'prompt'] as const;

      validScopes.forEach(scope => {
        const payload = {
          event: 'snapshot.failed',
          data: {
            snapshotId: 'test',
            scope,
            error: 'Test error',
          },
        };
        expect(SnapshotFailedPayloadSchema.safeParse(payload).success).toBe(true);
      });

      const invalidScope = {
        event: 'snapshot.failed',
        data: {
          snapshotId: 'test',
          scope: 'invalid',
          error: 'Test error',
        },
      };
      expect(SnapshotFailedPayloadSchema.safeParse(invalidScope).success).toBe(false);
    });

    it('should reject invalid event name', () => {
      const invalidEvent = {
        event: 'wrong.event',
        data: {
          snapshotId: 'test',
          scope: 'workspace',
          error: 'Test error',
        },
      };
      expect(SnapshotFailedPayloadSchema.safeParse(invalidEvent).success).toBe(false);
    });

    it('should require all mandatory fields', () => {
      const missingError = {
        event: 'snapshot.failed',
        data: {
          snapshotId: 'test',
          scope: 'workspace',
        },
      };
      expect(SnapshotFailedPayloadSchema.safeParse(missingError).success).toBe(false);
    });
  });

  describe('StatusEventSchema discriminated union', () => {
    it('should accept any valid status event', () => {
      const events = [
        {
          event: 'sync.status',
          data: { status: 'idle' },
        },
        {
          event: 'snapshot.created',
          data: {
            snapshotId: 'test',
            scope: 'workspace',
            path: '/path',
            stats: {
              filesCount: 0,
              attachmentsCount: 0,
              sizeBytes: 0,
            },
          },
        },
        {
          event: 'snapshot.failed',
          data: {
            snapshotId: 'test',
            scope: 'workspace',
            error: 'Test error',
          },
        },
      ];

      events.forEach(event => {
        expect(StatusEventSchema.safeParse(event).success).toBe(true);
      });
    });

    it('should reject events not in the union', () => {
      const invalidEvent = {
        event: 'unknown.event',
        data: {},
      };
      expect(StatusEventSchema.safeParse(invalidEvent).success).toBe(false);
    });

    it('should discriminate correctly by event name', () => {
      const syncEvent = {
        event: 'sync.status',
        data: { status: 'saving' },
      };
      const result = StatusEventSchema.safeParse(syncEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event).toBe('sync.status');
      }

      const snapshotEvent = {
        event: 'snapshot.created',
        data: {
          snapshotId: 'test',
          scope: 'workspace',
          path: '/path',
          stats: {
            filesCount: 0,
            attachmentsCount: 0,
            sizeBytes: 0,
          },
        },
      };
      const result2 = StatusEventSchema.safeParse(snapshotEvent);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data.event).toBe('snapshot.created');
      }
    });
  });
});
