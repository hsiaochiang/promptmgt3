/**
 * Backup Statistics Test (SC-003)
 * 
 * Verifies:
 * 1. Success/failure criteria are properly defined and tracked
 * 2. Statistics output format and accuracy
 * 3. 7-day and 30-day views work correctly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { getBackupStatistics, formatBytes } from '../../apps/server/src/backup/statistics.js';
import { createSnapshot } from '../../apps/server/src/backup/snapshot.js';
import { getDailySnapshotPath } from '../../apps/server/src/fs-layout/index.js';

describe('SC-003: Backup Statistics', () => {
  let testRoot: string;

  beforeEach(async () => {
    testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'pah-stats-test-'));
  });

  afterEach(async () => {
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('should track successful snapshot with correct status', async () => {
    // Create a test file
    await fs.writeFile(path.join(testRoot, 'test.txt'), 'test content', 'utf-8');

    // Create snapshot
    const snapshot = await createSnapshot(testRoot, 'workspace', 'Test snapshot');

    // Verify manifest has success status
    const manifestPath = path.join(snapshot.snapshotPath!, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    expect(manifest.status).toBe('success');
    expect(manifest.errors).toEqual([]);
    expect(manifest.warnings).toEqual([]);
    expect(manifest.stats.filesCount).toBeGreaterThan(0);
  });

  it('should collect statistics for 7-day period', async () => {
    // Create several test snapshots
    await fs.writeFile(path.join(testRoot, 'file1.txt'), 'content 1', 'utf-8');
    await createSnapshot(testRoot, 'workspace', 'Snapshot 1');

    await fs.writeFile(path.join(testRoot, 'file2.txt'), 'content 2', 'utf-8');
    await createSnapshot(testRoot, 'workspace', 'Snapshot 2');

    await fs.writeFile(path.join(testRoot, 'file3.txt'), 'content 3', 'utf-8');
    await createSnapshot(testRoot, 'workspace', 'Snapshot 3');

    // Get 7-day statistics
    const stats = await getBackupStatistics(testRoot, 7);

    expect(stats.period).toBe('7d');
    expect(stats.totalSnapshots).toBe(3);
    expect(stats.successfulSnapshots).toBe(3);
    expect(stats.failedSnapshots).toBe(0);
    expect(stats.partialSnapshots).toBe(0);
    expect(stats.successRate).toBe(100);
    expect(stats.totalSize).toBeGreaterThan(0);
    expect(stats.averageSize).toBeGreaterThan(0);
    expect(stats.lastSnapshotAt).toBeDefined();
    expect(stats.lastSuccessAt).toBeDefined();
    expect(stats.recentSnapshots).toHaveLength(3);
  });

  it('should collect statistics for 30-day period', async () => {
    await fs.writeFile(path.join(testRoot, 'test.txt'), 'test', 'utf-8');
    await createSnapshot(testRoot, 'workspace');

    const stats = await getBackupStatistics(testRoot, 30);

    expect(stats.period).toBe('30d');
    expect(stats.totalSnapshots).toBe(1);
    expect(stats.successfulSnapshots).toBe(1);
    expect(stats.successRate).toBe(100);
  });

  it('should calculate success rate correctly with mixed results', async () => {
    // Create some successful snapshots
    await fs.writeFile(path.join(testRoot, 'file1.txt'), 'content', 'utf-8');
    const snap1 = await createSnapshot(testRoot, 'workspace');
    const snap2 = await createSnapshot(testRoot, 'workspace');

    // Manually create a failed snapshot manifest
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const failedId = `snapshot-failed-${Date.now()}`;
    const baseDir = getDailySnapshotPath(testRoot, date);
    const failedDir = path.join(baseDir, failedId);
    await fs.mkdir(failedDir, { recursive: true });

    const failedManifest = {
      snapshotId: failedId,
      scope: 'workspace',
      createdAt: now.toISOString(),
      path: failedDir,
      stats: { filesCount: 0, attachmentsCount: 0, sizeBytes: 0 },
      status: 'failed',
      errors: ['模擬錯誤：無法寫入檔案'],
      warnings: [],
    };
    await fs.writeFile(
      path.join(failedDir, 'manifest.json'),
      JSON.stringify(failedManifest, null, 2),
      'utf-8'
    );

    // Manually create a partial snapshot manifest
    const partialId = `snapshot-partial-${Date.now()}`;
    const partialDir = path.join(baseDir, partialId);
    await fs.mkdir(partialDir, { recursive: true });

    const partialManifest = {
      snapshotId: partialId,
      scope: 'workspace',
      createdAt: now.toISOString(),
      path: partialDir,
      stats: { filesCount: 5, attachmentsCount: 0, sizeBytes: 1024 },
      status: 'partial',
      errors: [],
      warnings: ['警告：部分附件遺失'],
    };
    await fs.writeFile(
      path.join(partialDir, 'manifest.json'),
      JSON.stringify(partialManifest, null, 2),
      'utf-8'
    );

    // Get statistics
    const stats = await getBackupStatistics(testRoot, 7);

    expect(stats.totalSnapshots).toBe(4); // 2 success + 1 failed + 1 partial
    expect(stats.successfulSnapshots).toBe(2);
    expect(stats.failedSnapshots).toBe(1);
    expect(stats.partialSnapshots).toBe(1);
    expect(stats.successRate).toBe(50); // 2/4 = 50%

    // Verify recent snapshots contain error/warning info
    const failedSnapshot = stats.recentSnapshots.find(s => s.status === 'failed');
    expect(failedSnapshot).toBeDefined();
    expect(failedSnapshot!.errors).toHaveLength(1);

    const partialSnapshot = stats.recentSnapshots.find(s => s.status === 'partial');
    expect(partialSnapshot).toBeDefined();
    expect(partialSnapshot!.warnings).toHaveLength(1);
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should handle empty statistics gracefully', async () => {
    const stats = await getBackupStatistics(testRoot, 7);

    expect(stats.totalSnapshots).toBe(0);
    expect(stats.successfulSnapshots).toBe(0);
    expect(stats.failedSnapshots).toBe(0);
    expect(stats.successRate).toBe(0);
    expect(stats.totalSize).toBe(0);
    expect(stats.averageSize).toBe(0);
    expect(stats.lastSnapshotAt).toBeUndefined();
    expect(stats.lastSuccessAt).toBeUndefined();
    expect(stats.recentSnapshots).toEqual([]);
  });

  it('should only include snapshots within the specified period', async () => {
    // Create a snapshot
    await fs.writeFile(path.join(testRoot, 'test.txt'), 'test', 'utf-8');
    await createSnapshot(testRoot, 'workspace');

    // Create an old snapshot manually (older than 7 days)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    const oldDateStr = oldDate.toISOString().slice(0, 10);
    const oldId = `snapshot-old-${Date.now()}`;
    const oldDir = getDailySnapshotPath(testRoot, oldDateStr);
    const oldSnapshotDir = path.join(oldDir, oldId);
    await fs.mkdir(oldSnapshotDir, { recursive: true });

    const oldManifest = {
      snapshotId: oldId,
      scope: 'workspace',
      createdAt: oldDate.toISOString(),
      path: oldSnapshotDir,
      stats: { filesCount: 1, attachmentsCount: 0, sizeBytes: 100 },
      status: 'success',
      errors: [],
      warnings: [],
    };
    await fs.writeFile(
      path.join(oldSnapshotDir, 'manifest.json'),
      JSON.stringify(oldManifest, null, 2),
      'utf-8'
    );

    // 7-day stats should only include the recent one
    const stats7d = await getBackupStatistics(testRoot, 7);
    expect(stats7d.totalSnapshots).toBe(1);

    // 30-day stats should include both
    const stats30d = await getBackupStatistics(testRoot, 30);
    expect(stats30d.totalSnapshots).toBe(2);
  });

  it('should limit recent snapshots to 10 items', async () => {
    // Create 15 snapshots
    for (let i = 0; i < 15; i++) {
      await fs.writeFile(path.join(testRoot, `file${i}.txt`), `content ${i}`, 'utf-8');
      await createSnapshot(testRoot, 'workspace', `Snapshot ${i}`);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const stats = await getBackupStatistics(testRoot, 7);

    expect(stats.totalSnapshots).toBe(15);
    expect(stats.recentSnapshots).toHaveLength(10); // Limited to 10
  });
});
