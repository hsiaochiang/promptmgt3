/**
 * T070 [P] [US3] Contract test：Snapshot/Version endpoints + manifest shape
 */

import { describe, it, expect } from 'vitest';
import {
  VersionEventSchema,
  VersionNodeSchema,
  VersionListResponseSchema,
  CreateSnapshotRequestSchema
} from '../../packages/contracts/src/dto/version.js';

describe('Contract - Snapshot / VersionEvent DTO', () => {
  it('should accept valid VersionEvent payload', () => {
    const payload = {
      id: 'snapshot-20240101T120000Z',
      type: 'snapshot',
      scope: 'workspace' as const,
      message: 'Daily snapshot',
      createdAt: '2024-01-01T12:00:00.000Z',
      snapshotPath: '/workspace/.pah/snapshots/daily/2024-01-01/snapshot-20240101T120000Z',
    };

    const result = VersionEventSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should require mandatory fields', () => {
    const invalid = {
      id: 'missing-fields',
    } as any;

    const result = VersionEventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
  describe('VersionNode Schema', () => {
    it('should accept valid VersionNode', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        entityId: 'project-123',
        entityType: 'project',
        versionType: 'manual',
        name: 'Milestone 1',
        timestamp: new Date().toISOString(),
        snapshotPath: '.pah/versions/p1/v1',
        titleSnapshot: 'My Project',
        fileSize: 1024,
      };
      expect(VersionNodeSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('VersionListResponse Schema', () => {
    it('should accept valid list response', () => {
      const valid = {
        items: [],
        total: 0
      };
      expect(VersionListResponseSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('CreateSnapshotRequest Schema', () => {
    it('should require name for manual snapshot', () => {
      const valid = {
        entityId: 'p1',
        entityType: 'project',
        name: 'Backup',
      };
      expect(CreateSnapshotRequestSchema.safeParse(valid).success).toBe(true);

      const invalid = {
        entityId: 'p1',
        entityType: 'project',
        // name missing
      };
      expect(CreateSnapshotRequestSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
