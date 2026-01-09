import { test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { createSnapshot } from '../../apps/server/src/backup/snapshot.ts';
import { getSnapshotsDir } from '../../apps/server/src/fs-layout/index.ts';

const TEST_ROOT = path.join(process.cwd(), 'tmp-test-snapshot-layout');

beforeEach(async () => {
  await fs.mkdir(TEST_ROOT, { recursive: true });
});

afterEach(async () => {
  await fs.rm(TEST_ROOT, { recursive: true, force: true });
});

test('Snapshot Layout Integration', async () => {
  // Setup: Create some files in root
  await fs.writeFile(path.join(TEST_ROOT, 'file1.txt'), 'content1');
  await fs.mkdir(path.join(TEST_ROOT, 'subdir'));
  await fs.writeFile(path.join(TEST_ROOT, 'subdir/file2.txt'), 'content2');

  // Action: Create snapshot
  const event = await createSnapshot(TEST_ROOT, 'workspace', 'test snapshot');

  // Verify: Snapshot directory exists
  const snapshotPath = event.snapshotPath;
  expect(snapshotPath).toBeDefined();

  // Verify: Manifest exists
  const manifestPath = path.join(snapshotPath!, 'manifest.json');
  const manifestRaw = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestRaw);

  expect(manifest.snapshotId).toBe(event.id);
  expect(manifest.scope).toBe('workspace');
  expect(manifest.status).toBe('success');

  // Verify: Content is copied to 'root'
  const rootDir = path.join(snapshotPath!, 'root');
  const file1 = await fs.readFile(path.join(rootDir, 'file1.txt'), 'utf-8');
  expect(file1).toBe('content1');

  const file2 = await fs.readFile(path.join(rootDir, 'subdir/file2.txt'), 'utf-8');
  expect(file2).toBe('content2');
});
