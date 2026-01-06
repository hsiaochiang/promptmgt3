import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Attachments Visual: upload image and verify visible in editor content', async ({ page, request }) => {
  const now = Date.now();

  // Setup: create project + prompt
  const cp = await request.post(`${backendBase}/api/projects`, { data: { title: `Vis Project ${now}` } });
  expect(cp.status()).toBe(201);
  const project = await cp.json();

  const cpr = await request.post(`${backendBase}/api/prompts`, { data: { title: `Vis Prompt ${now}`, projectId: project.id, body: '' } });
  expect(cpr.status()).toBe(201);
  const prompt = await cpr.json();

  // Open UI and select prompt
  await page.goto('/');
  await page.locator('button', { hasText: '資料庫' }).click();
  await page.locator('h3', { hasText: prompt.title }).first().click();

  // Simulate paste event with an image file into the editor
  await page.evaluate(() => {
    // no-op placeholder; we use file-in-memory approach below via dispatch
  });

  await page.evaluate(async () => {
    const editor = document.querySelector('.cm-editor');
    if (!editor) return;
    const blob = new Blob(['fakeimagecontent'], { type: 'image/png' });
    const file = new File([blob], 'pic.png', { type: 'image/png' });
    const dt = new DataTransfer();
    dt.items.add(file as any);
    const ev = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
    editor.dispatchEvent(ev as any);
  });

  // wait for upload and expect editor content to contain filename reference
  await page.waitForTimeout(1000);
  const found = await page.locator('text=pic.png').count();
  expect(found).toBeGreaterThanOrEqual(0);

  // Optionally, if editor render shows an <img>, check it
  const imgCount = await page.locator('img[src*="pic.png"]').count();
  // Either markdown text exists or an img element
  expect(imgCount > 0 || found > 0).toBeTruthy();

  // cleanup
  try { await request.delete(`${backendBase}/api/prompts/${prompt.id}`); } catch {}
  try { await request.delete(`${backendBase}/api/projects/${project.id}`); } catch {}
});
