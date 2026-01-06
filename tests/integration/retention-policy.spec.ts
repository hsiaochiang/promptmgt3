/**
 * T072 [P] [US3] Integration test：retention 清理規則（基礎：只保留最近 N 天）
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';
import { enforceSnapshotRetention } from '../../apps/server/src/backup/retention.js';
import { getSnapshotsDir } from '../../apps/server/src/fs-layout/index.js';

describe('Integration - Snapshot Retention Policy', () => {
  const testDataDir = path.join(process.cwd(), 'test-data', 'retention-tests');
  let rootPath: string;

  beforeEach(async () => {
    rootPath = path.join(testDataDir, `ws-${nanoid()}`);
    const snapshotsRoot = getSnapshotsDir(rootPath);
    const days = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04'];
    for (const day of days) {
      const dayDir = path.join(snapshotsRoot, day);
      await fs.mkdir(dayDir, { recursive: true });
      await fs.writeFile(path.join(dayDir, 'dummy.txt'), day, 'utf-8');
    }
  });

  afterEach(async () => {
    await fs.rm(rootPath, { recursive: true, force: true });
  });

  it('keeps only the newest N daily snapshot folders', async () => {
    await enforceSnapshotRetention(rootPath, 2);

    const snapshotsRoot = getSnapshotsDir(rootPath);
    const entries = await fs.readdir(snapshotsRoot);
    entries.sort();

    expect(entries).toEqual(['2024-01-03', '2024-01-04']);
  });

  it('never deletes days that contain pinned snapshots', async () => {
    const snapshotsRoot = getSnapshotsDir(rootPath);
    const pinnedDayDir = path.join(snapshotsRoot, '2024-01-01');
    const pinnedSnapshotDir = path.join(pinnedDayDir, 'snapshot-pinned');

    await fs.mkdir(pinnedSnapshotDir, { recursive: true });

    const manifest = {
      snapshotId: 'snapshot-pinned',
      scope: 'workspace',
      createdAt: '2024-01-01T00:00:00.000Z',
      path: pinnedSnapshotDir,
      stats: {
        filesCount: 0,
        attachmentsCount: 0,
        sizeBytes: 0,
      },
      status: 'success' as const,
      errors: [] as string[],
      warnings: [] as string[],
      pinned: true,
    };

    await fs.writeFile(
      path.join(pinnedSnapshotDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8',
    );

    await enforceSnapshotRetention(rootPath, 2);

    const entries = await fs.readdir(snapshotsRoot);
    entries.sort();

    expect(entries).toEqual(['2024-01-01', '2024-01-03', '2024-01-04']);
  });
});
