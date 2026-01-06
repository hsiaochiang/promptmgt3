import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Backup: create snapshot and get backup statistics', async ({ request }) => {
  let snapshotId: string | undefined;

  try {
    // Trigger workspace snapshot
    const snapRes = await request.post(`${backendBase}/api/snapshots`, { data: { message: 'e2e snapshot' } });
    expect(snapRes.status()).toBe(201);
    const snapData = await snapRes.json();
    snapshotId = snapData.id; // 假設回傳有 id，若無則需調整

    // Get backup statistics (7d)
    const statsRes = await request.get(`${backendBase}/api/backups/statistics?period=7d`);
    expect(statsRes.status()).toBe(200);
    const stats = await statsRes.json();
    // Stats contains recentSnapshots array with filesCount/sizeBytes per snapshot
    expect(Array.isArray(stats.recentSnapshots)).toBeTruthy();
    expect(stats.recentSnapshots.length).toBeGreaterThan(0);
    const recent = stats.recentSnapshots[0];
    expect(recent).toHaveProperty('filesCount');
    expect(recent).toHaveProperty('sizeBytes');
  } finally {
    // Cleanup: delete snapshot if created (假設有此 API)
    if (snapshotId) {
      await request.delete(`${backendBase}/api/snapshots/${snapshotId}`).catch(() => {});
    }
  }
});
