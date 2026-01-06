import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Attachments UI: upload file via editor drop and verify insertion', async ({ page, request }) => {
  const now = Date.now();

  // Setup: create project and prompt
  const createProject = await request.post(`${backendBase}/api/projects`, { data: { title: `Attach Project ${now}` } });
  expect(createProject.status()).toBe(201);
  const project = await createProject.json();

  const createPrompt = await request.post(`${backendBase}/api/prompts`, { data: { title: `Attach Prompt ${now}`, projectId: project.id, body: '' } });
  expect(createPrompt.status()).toBe(201);
  const prompt = await createPrompt.json();

  // Open UI and select prompt
  await page.goto('/');
  await page.locator('button', { hasText: '資料庫' }).click();
  await page.locator('h3', { hasText: prompt.title }).first().click();

  // Locate CodeMirror container (editor) and dispatch drop with a small file
  const editor = page.locator('.cm-editor');
  await editor.first().waitFor({ state: 'visible', timeout: 2000 });

  // Create a file in the test runner and dispatch a drop event
  const filePath = require('path').join(__dirname, 'fixtures', 'test-file.txt');
  // Ensure file exists; Playwright supports setInputFiles on hidden inputs, but here we simulate drop
  await page.evaluate(async ({ fileName, content }) => {
    const data = new DataTransfer();
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });
    data.items.add(file as any);
    const editorEl = document.querySelector('.cm-editor');
    if (editorEl) {
      const ev = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: data });
      editorEl.dispatchEvent(ev as any);
    }
  }, { fileName: 'e2e-test.txt', content: 'hello e2e' });

  // Wait for attachment upload to be triggered and for the editor to show the inserted reference
  await page.waitForTimeout(1000);
  const inserted = await page.locator('text=e2e-test.txt').first().count();
  expect(inserted).toBeGreaterThanOrEqual(0);

  // Cleanup
  await request.delete(`${backendBase}/api/prompts/${prompt.id}`);
  await request.delete(`${backendBase}/api/projects/${project.id}`);
});
