import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Trash UI: restore a deleted project via UI', async ({ page, request }) => {
  const now = Date.now();

  // Create project via API
  const createProject = await request.post(`${backendBase}/api/projects`, { data: { title: `Trash Project ${now}` } });
  expect(createProject.status()).toBe(201);
  const project = await createProject.json();

  // Delete project via API (move to trash)
  const delRes = await request.delete(`${backendBase}/api/projects/${project.id}`);
  expect(delRes.status()).toBe(200);

  // Open UI and go to 回收站
  await page.goto('/');
  await page.locator('button', { hasText: '回收站' }).click();

  // Wait for the trash item with title to appear
  const item = page.locator('div', { hasText: project.title });
  await item.first().waitFor({ state: 'visible', timeout: 3000 });

  // Click 復原 button within that item
  const restoreBtn = item.locator('button', { hasText: '復原' }).first();
  await restoreBtn.click();

  // Confirm by checking backend: project should exist again in scan
  const listRes = await request.get(`${backendBase}/api/projects`);
  expect(listRes.status()).toBe(200);
  const projects = await listRes.json();
  const found = projects.find((p: any) => p.id === project.id);
  expect(found).toBeTruthy();

  // Cleanup: delete project
  await request.delete(`${backendBase}/api/projects/${project.id}`);
});
