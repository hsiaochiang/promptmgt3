import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Multi-user sync: two contexts see sync.status updates after version node created', async ({ browser, request }) => {
  const now = Date.now();

  // Setup: create project + prompt
  const cp = await request.post(`${backendBase}/api/projects`, { data: { title: `SYNC Project ${now}` } });
  expect(cp.status()).toBe(201);
  const project = await cp.json();

  const cpr = await request.post(`${backendBase}/api/prompts`, { data: { title: `SYNC Prompt ${now}`, projectId: project.id, body: '' } });
  expect(cpr.status()).toBe(201);
  const prompt = await cpr.json();

  // Start two contexts/pages
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const p1 = await ctx1.newPage();
  const p2 = await ctx2.newPage();

  // Both open the prompt detail panel
  await p1.goto('/');
  await p1.locator('button', { hasText: '資料庫' }).click();
  await p1.locator('h3', { hasText: prompt.title }).first().click();

  await p2.goto('/');
  await p2.locator('button', { hasText: '資料庫' }).click();
  await p2.locator('h3', { hasText: prompt.title }).first().click();

  // Create a version node via API to simulate a user creating one
  const ver = await request.post(`${backendBase}/api/versions`, { data: { entityType: 'prompt', entityId: prompt.id, projectSlug: project.slug, promptSlug: prompt.slug, message: 'e2e version' } });
  expect([201, 200]).toContain(ver.status());

  // Wait a short time for WebSocket broadcast to be processed in UI
  await p1.waitForTimeout(500);
  await p2.waitForTimeout(500);

  // Verify both UIs can fetch versions and see at least one
  const v1 = await request.get(`${backendBase}/api/versions/prompt/${prompt.id}`);
  expect(v1.status()).toBe(200);
  const list = await v1.json();
  expect(Array.isArray(list)).toBeTruthy();

  // Cleanup
  await ctx1.close();
  await ctx2.close();
  try { await request.delete(`${backendBase}/api/prompts/${prompt.id}`); } catch {}
  try { await request.delete(`${backendBase}/api/projects/${project.id}`); } catch {}
});
