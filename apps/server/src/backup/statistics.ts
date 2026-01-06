import fs from 'fs/promises';
import path from 'path';
import { getSnapshotsDir } from '../fs-layout/index.js';

export interface SnapshotManifest {
  snapshotId: string;
  scope: 'workspace' | 'project' | 'prompt';
  createdAt: string;
  path: string;
  stats: {
    filesCount: number;
    attachmentsCount: number;
    sizeBytes: number;
  };
  status: 'success' | 'failed' | 'partial';
  errors: string[];
  warnings: string[];
}

export interface BackupStatistics {
  period: '7d' | '30d';
  totalSnapshots: number;
  successfulSnapshots: number;
  failedSnapshots: number;
  partialSnapshots: number;
  successRate: number; // 0-100
  totalSize: number; // bytes
  averageSize: number; // bytes
  lastSnapshotAt?: string;
  lastSuccessAt?: string;
  recentSnapshots: {
    id: string;
    createdAt: string;
    status: 'success' | 'failed' | 'partial';
    filesCount: number;
    sizeBytes: number;
    errors: string[];
    warnings: string[];
  }[];
}

/**
 * Collect backup statistics for a given time period
 */
export async function getBackupStatistics(
  rootPath: string,
  periodDays: 7 | 30
): Promise<BackupStatistics> {
  const snapshotsRoot = getSnapshotsDir(rootPath);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);

  const snapshots: SnapshotManifest[] = [];

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
          const manifest = JSON.parse(content) as SnapshotManifest;
          
          // Filter by date
          const createdAt = new Date(manifest.createdAt);
          if (createdAt >= cutoffDate) {
            snapshots.push(manifest);
          }
        } catch {
          // Ignore broken manifests
        }
      }
    }
  } catch {
    // No snapshots directory yet
  }

  // Calculate statistics
  const totalSnapshots = snapshots.length;
  const successfulSnapshots = snapshots.filter(s => s.status === 'success').length;
  const failedSnapshots = snapshots.filter(s => s.status === 'failed').length;
  const partialSnapshots = snapshots.filter(s => s.status === 'partial').length;
  
  const successRate = totalSnapshots > 0 
    ? Math.round((successfulSnapshots / totalSnapshots) * 100) 
    : 0;

  const totalSize = snapshots.reduce((sum, s) => sum + (s.stats?.sizeBytes || 0), 0);
  const averageSize = totalSnapshots > 0 ? Math.round(totalSize / totalSnapshots) : 0;

  // Sort by date descending
  snapshots.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const lastSnapshot = snapshots[0];
  const lastSuccessful = snapshots.find(s => s.status === 'success');

  return {
    period: periodDays === 7 ? '7d' : '30d',
    totalSnapshots,
    successfulSnapshots,
    failedSnapshots,
    partialSnapshots,
    successRate,
    totalSize,
    averageSize,
    lastSnapshotAt: lastSnapshot?.createdAt,
    lastSuccessAt: lastSuccessful?.createdAt,
    recentSnapshots: snapshots.slice(0, 10).map(s => ({
      id: s.snapshotId,
      createdAt: s.createdAt,
      status: s.status,
      filesCount: s.stats?.filesCount || 0,
      sizeBytes: s.stats?.sizeBytes || 0,
      errors: s.errors || [],
      warnings: s.warnings || [],
    })),
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Print statistics summary to console
 */
export function printStatisticsSummary(stats: BackupStatistics): void {
  console.log(`\n=== 備份統計（最近 ${stats.period === '7d' ? '7' : '30'} 天）===`);
  console.log(`總快照數: ${stats.totalSnapshots}`);
  console.log(`成功: ${stats.successfulSnapshots}`);
  console.log(`失敗: ${stats.failedSnapshots}`);
  console.log(`部分成功: ${stats.partialSnapshots}`);
  console.log(`成功率: ${stats.successRate}%`);
  console.log(`總容量: ${formatBytes(stats.totalSize)}`);
  console.log(`平均容量: ${formatBytes(stats.averageSize)}`);
  
  if (stats.lastSnapshotAt) {
    console.log(`最後快照: ${new Date(stats.lastSnapshotAt).toLocaleString('zh-TW')}`);
  }
  
  if (stats.lastSuccessAt) {
    console.log(`最後成功: ${new Date(stats.lastSuccessAt).toLocaleString('zh-TW')}`);
  }

  if (stats.recentSnapshots.length > 0) {
    console.log(`\n最近 ${Math.min(10, stats.recentSnapshots.length)} 筆快照:`);
    stats.recentSnapshots.forEach(s => {
      const statusIcon = s.status === 'success' ? '✓' : s.status === 'failed' ? '✗' : '⚠';
      const errorInfo = s.errors.length > 0 ? ` (${s.errors.length} 個錯誤)` : '';
      const warnInfo = s.warnings.length > 0 ? ` (${s.warnings.length} 個警告)` : '';
      console.log(`  ${statusIcon} ${new Date(s.createdAt).toLocaleString('zh-TW')} - ${formatBytes(s.sizeBytes)}${errorInfo}${warnInfo}`);
    });
  }
  
  console.log('');
}
