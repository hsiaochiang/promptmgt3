import fs from 'fs/promises';
import path from 'path';
import { getDailySnapshotPath, getSnapshotsDir, isSystemPath } from '../fs-layout/index.js';
import type { VersionEvent } from '@pah/contracts';

async function copyDir(src: string, dest: string, filter?: (fullPath: string) => boolean): Promise<{ files: number; size: number; }>{
  let files = 0;
  let size = 0;

  try {
    const stat = await fs.stat(src);
    if (!stat.isDirectory()) return { files, size };
  } catch {
    return { files, size };
  }

  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (filter && !filter(srcPath)) continue;

    if (entry.isDirectory()) {
      const child = await copyDir(srcPath, destPath, filter);
      files += child.files;
      size += child.size;
    } else if (entry.isFile()) {
      const stat = await fs.stat(srcPath);
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
      files += 1;
      size += stat.size;
    }
  }

  return { files, size };
}

export async function createSnapshot(rootPath: string, scope: 'workspace' | 'project' | 'prompt' = 'workspace', message?: string): Promise<VersionEvent> {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const snapshotId = `snapshot-${now.toISOString().replace(/[:.]/g, '')}`;

  const baseDir = getDailySnapshotPath(rootPath, date);
  const snapshotDir = path.join(baseDir, snapshotId);

  await fs.mkdir(snapshotDir, { recursive: true });

  // Copy workspace root (excluding .pah and cache) into root/
  const rootTarget = path.join(snapshotDir, 'root');
  const filter = (fullPath: string) => {
    if (isSystemPath(rootPath, fullPath)) return false;
    return true;
  };
  const rootStats = await copyDir(rootPath, rootTarget, filter);

  // Copy attachments directory if present into attachments/
  const attachmentsSrc = path.join(rootPath, 'attachments');
  const attachmentsTarget = path.join(snapshotDir, 'attachments');
  let attachmentsStats = { files: 0, size: 0 };
  try {
    const stat = await fs.stat(attachmentsSrc);
    if (stat.isDirectory()) {
      attachmentsStats = await copyDir(attachmentsSrc, attachmentsTarget);
    }
  } catch {
    // no attachments directory, ignore
  }

  const manifest = {
    snapshotId,
    scope,
    createdAt: now.toISOString(),
    path: snapshotDir,
    stats: {
      filesCount: rootStats.files,
      attachmentsCount: attachmentsStats.files,
      sizeBytes: rootStats.size + attachmentsStats.size,
    },
    status: 'success' as 'success' | 'failed' | 'partial',
    errors: [] as string[],
    warnings: [] as string[],
  };

  await fs.writeFile(path.join(snapshotDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  const event: VersionEvent = {
    id: snapshotId,
    type: 'snapshot',
    scope,
    message,
    createdAt: manifest.createdAt,
    snapshotPath: snapshotDir,
  };

  return event;
}

export async function listSnapshots(rootPath: string): Promise<VersionEvent[]> {
  const events: VersionEvent[] = [];
  const snapshotsRoot = getSnapshotsDir(rootPath);

  try {
    const dayDirs = await fs.readdir(snapshotsRoot, { withFileTypes: true });
    for (const day of dayDirs) {
      if (!day.isDirectory()) continue;
      const dayPath = path.join(snapshotsRoot, day.name);
      const snapshotDirs = await fs.readdir(dayPath, { withFileTypes: true });
      for (const snap of snapshotDirs) {
        if (!snap.isDirectory()) continue;
        const snapPath = path.join(dayPath, snap.name);
        const manifestPath = path.join(snapPath, 'manifest.json');
        try {
          const content = await fs.readFile(manifestPath, 'utf-8');
          const manifest = JSON.parse(content) as { snapshotId: string; scope: 'workspace' | 'project' | 'prompt'; createdAt: string; };
          events.push({
            id: manifest.snapshotId,
            type: 'snapshot',
            scope: manifest.scope,
            message: undefined,
            createdAt: manifest.createdAt,
            snapshotPath: snapPath,
          });
        } catch {
          // ignore broken manifests
        }
      }
    }
  } catch {
    // no snapshots yet
  }

  // Newest first
  events.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return events;
}
