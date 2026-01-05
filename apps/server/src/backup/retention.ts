import fs from 'fs/promises';
import path from 'path';
import { getSnapshotsDir } from '../fs-layout/index.js';

/**
 * Simple retention: keep the most recent N daily snapshot folders, delete older ones.
 */
export async function enforceSnapshotRetention(rootPath: string, keepDays: number = 30): Promise<void> {
  const snapshotsRoot = getSnapshotsDir(rootPath);
  try {
    const entries = await fs.readdir(snapshotsRoot, { withFileTypes: true });
    const dayDirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort();
    if (dayDirs.length <= keepDays) return;
    const toDelete = dayDirs.slice(0, dayDirs.length - keepDays);
    for (const day of toDelete) {
      await fs.rm(path.join(snapshotsRoot, day), { recursive: true, force: true });
    }
  } catch {
    // if snapshots dir does not exist, nothing to do
  }
}
