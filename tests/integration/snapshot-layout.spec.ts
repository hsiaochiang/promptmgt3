/**
 * T071 [P] [US3] Integration test：snapshot layout 驗證（manifest/root/attachments）
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';
import { createSnapshot } from '../../apps/server/src/backup/snapshot.js';
import { getDailySnapshotPath } from '../../apps/server/src/fs-layout/index.js';

describe('Integration - Snapshot Layout', () => {
  const testDataDir = path.join(process.cwd(), 'test-data', 'snapshot-tests');
  let rootPath: string;

  beforeEach(async () => {
    rootPath = path.join(testDataDir, `ws-${nanoid()}`);
    const projectsDir = path.join(rootPath, 'projects', 'p1');
    const attachmentsDir = path.join(rootPath, 'attachments');

    await fs.mkdir(projectsDir, { recursive: true });
    await fs.mkdir(attachmentsDir, { recursive: true });

    await fs.writeFile(path.join(projectsDir, 'project.md'), '# Project', 'utf-8');
    await fs.writeFile(path.join(attachmentsDir, 'img.png'), 'binary', 'utf-8');
  });

  afterEach(async () => {
    await fs.rm(rootPath, { recursive: true, force: true });
  });

  it('creates manifest, root and attachments layout', async () => {
    const event = await createSnapshot(rootPath, 'workspace', 'test snapshot');

    const date = event.createdAt.slice(0, 10);
    const dailyDir = getDailySnapshotPath(rootPath, date);

    const stat = await fs.stat(dailyDir);
    expect(stat.isDirectory()).toBe(true);

    const manifestPath = path.join(event.snapshotPath, 'manifest.json');
    const rootDir = path.join(event.snapshotPath, 'root');
    const attachmentsDir = path.join(event.snapshotPath, 'attachments');

    const manifestRaw = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestRaw);

    expect(manifest.snapshotId).toBe(event.id);
    expect(manifest.scope).toBe('workspace');
    expect(manifest.stats).toBeDefined();

    const rootStat = await fs.stat(rootDir);
    expect(rootStat.isDirectory()).toBe(true);

    const attachmentsStat = await fs.stat(attachmentsDir);
    expect(attachmentsStat.isDirectory()).toBe(true);
  });
});
