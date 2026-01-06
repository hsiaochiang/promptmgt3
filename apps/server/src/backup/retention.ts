import fs from 'fs/promises';
import path from 'path';
import { getSnapshotsDir } from '../fs-layout/index.js';

async function dayHasPinnedSnapshot(dayPath: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dayPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(dayPath, entry.name, 'manifest.json');
      try {
        const raw = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(raw) as { pinned?: boolean };
        if (manifest.pinned) {
          return true;
        }
      } catch {
        // ignore broken or missing manifest
      }
    }
  } catch {
    // day directory might have been removed or is unreadable; treat as not pinned
  }
  return false;
}

/**
 * Simple retention: keep the most recent N daily snapshot folders, delete older ones.
 * If a day contains any snapshot with manifest.pinned === true, that day is never deleted automatically.
 */
export async function enforceSnapshotRetention(rootPath: string, keepDays: number = 30): Promise<void> {
  const snapshotsRoot = getSnapshotsDir(rootPath);
  try {
    const entries = await fs.readdir(snapshotsRoot, { withFileTypes: true });
    const dayDirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort();
    if (dayDirs.length <= keepDays) return;

    const cutoffIndex = dayDirs.length - keepDays;
    for (let i = 0; i < cutoffIndex; i++) {
      const day = dayDirs[i];
      const dayPath = path.join(snapshotsRoot, day);
      const hasPinned = await dayHasPinnedSnapshot(dayPath);
      if (hasPinned) {
        continue;
      }
      await fs.rm(dayPath, { recursive: true, force: true });
    }
  } catch {
    // if snapshots dir does not exist, nothing to do
  }
}
