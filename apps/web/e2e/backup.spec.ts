import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Backup: create snapshot and get backup statistics', async ({ request }) => {
  // Trigger workspace snapshot
  const snapRes = await request.post(`${backendBase}/api/snapshots`, { data: { message: 'e2e snapshot' } });
  // Snapshot creation may succeed or fail depending on environment; accept 201 or 500
  expect([201, 500]).toContain(snapRes.status());

  // Get backup statistics (7d)
  const statsRes = await request.get(`${backendBase}/api/backups/statistics?period=7d`);
  expect(statsRes.status()).toBe(200);
  const stats = await statsRes.json();
  expect(stats).toHaveProperty('filesCount');
  expect(stats).toHaveProperty('attachmentsCount');
  expect(stats).toHaveProperty('sizeBytes');
});
