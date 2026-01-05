/**
 * T070 [P] [US3] Contract test：Snapshot/Version endpoints + manifest shape
 */

import { describe, it, expect } from 'vitest';
import { VersionEventSchema } from '../../packages/contracts/src/dto/version.js';

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
});
