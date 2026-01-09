import { test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { enforceSnapshotRetention } from '../../apps/server/src/backup/retention.ts';
import { getSnapshotsDir } from '../../apps/server/src/fs-layout/index.ts';

const TEST_ROOT = path.join(process.cwd(), 'tmp-test-retention');

beforeEach(async () => {
  await fs.mkdir(TEST_ROOT, { recursive: true });
});

afterEach(async () => {
  await fs.rm(TEST_ROOT, { recursive: true, force: true });
});

async function createMockSnapshot(root: string, date: string, pinned: boolean = false) {
  const snapshotsDir = getSnapshotsDir(root);
  const dayDir = path.join(snapshotsDir, date);
  const snapDir = path.join(dayDir, `snapshot-mock-${Date.now()}`);

  await fs.mkdir(snapDir, { recursive: true });

  const manifest = {
    snapshotId: 'mock',
    pinned,
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(path.join(snapDir, 'manifest.json'), JSON.stringify(manifest), 'utf-8');
}

test('Retention Policy Integration', async () => {
  // Create snapshots for 5 days
  // Day 1 (Oldest) - Not Pinned
  await createMockSnapshot(TEST_ROOT, '2023-01-01', false);
  // Day 2 - Pinned
  await createMockSnapshot(TEST_ROOT, '2023-01-02', true);
  // Day 3 - Not Pinned
  await createMockSnapshot(TEST_ROOT, '2023-01-03', false);
  // Day 4 - Not Pinned
  await createMockSnapshot(TEST_ROOT, '2023-01-04', false);
  // Day 5 (Newest) - Not Pinned
  await createMockSnapshot(TEST_ROOT, '2023-01-05', false);

  // Run retention with keepDays = 2
  // Should keep: Day 4, Day 5 (Newest 2).
  // AND Day 2 (Pinned).
  // Should delete: Day 1, Day 3.

  await enforceSnapshotRetention(TEST_ROOT, 2);

  const snapshotsDir = getSnapshotsDir(TEST_ROOT);
  const days = await fs.readdir(snapshotsDir);

  console.log('Days remaining:', days);

  expect(days).toContain('2023-01-02'); // Pinned
  expect(days).toContain('2023-01-04'); // Kept
  expect(days).toContain('2023-01-05'); // Kept
  expect(days).not.toContain('2023-01-01'); // Deleted
  expect(days).not.toContain('2023-01-03'); // Deleted
});
