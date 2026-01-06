import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Conflict & Restore: simulate two users and resolve conflict via UI', async ({ browser, request }) => {
  const now = Date.now();

  // Setup: create project + prompt
  const cp = await request.post(`${backendBase}/api/projects`, { data: { title: `CF Project ${now}` } });
  expect(cp.status()).toBe(201);
  const project = await cp.json();

  const cpr = await request.post(`${backendBase}/api/prompts`, { data: { title: `CF Prompt ${now}`, projectId: project.id, body: 'initial' } });
  expect(cpr.status()).toBe(201);
  const prompt = await cpr.json();

  // Create two browser contexts to simulate two users
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  // User A opens and edits, but does not save immediately (autosave will handle)
  await pageA.goto('/');
  await pageA.locator('button', { hasText: '資料庫' }).click();
  await pageA.locator('h3', { hasText: prompt.title }).first().click();
  const titleInputA = pageA.locator('label:has-text("標題") + input[type="text"]');
  await titleInputA.fill('User A edit');

  // User B opens and saves immediately (simulate external save)
  await pageB.goto('/');
  await pageB.locator('button', { hasText: '資料庫' }).click();
  await pageB.locator('h3', { hasText: prompt.title }).first().click();
  const titleInputB = pageB.locator('label:has-text("標題") + input[type="text"]');
  await titleInputB.fill('User B edit');
  // trigger save via awaiting autosave; poll backend until changed
  const start = Date.now();
  while (Date.now() - start < 5000) {
    const r = await request.get(`${backendBase}/api/prompts/${prompt.id}`);
    const data = await r.json();
    if (data.title === 'User B edit') break;
    await new Promise(r => setTimeout(r, 300));
  }

  // Now User A attempts to save (autosave or manual), should see ConflictBanner
  // Force a refresh to let client detect conflict
  await pageA.reload();
  // Click '重新整理' or '覆寫儲存' via ConflictBanner
  const refreshBtn = pageA.locator('button', { hasText: '重新整理' }).first();
  await refreshBtn.click();
  // After refresh, prompt title should reflect server value
  await pageA.waitForTimeout(500);
  const current = await request.get(`${backendBase}/api/prompts/${prompt.id}`);
  const curJson = await current.json();
  expect(curJson.title).toBe('User B edit');

  // Cleanup
  await contextA.close();
  await contextB.close();
  try { await request.delete(`${backendBase}/api/prompts/${prompt.id}`); } catch {}
  try { await request.delete(`${backendBase}/api/projects/${project.id}`); } catch {}
});
