import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('UI CRUD: edit prompt title via DetailPanel and autosave', { timeout: 60_000 }, async ({ page, request }) => {
  const now = Date.now();
  let project: any = null;
  let prompt: any = null;

  try {
    // Setup: create a project and a prompt via API
    const createProject = await request.post(`${backendBase}/api/projects`, { data: { title: `UI Project ${now}` } });
    expect(createProject.status()).toBe(201);
    project = await createProject.json();

    const createPrompt = await request.post(`${backendBase}/api/prompts`, { data: { title: `UI Prompt ${now}`, projectId: project.id, body: 'initial body' } });
    expect(createPrompt.status()).toBe(201);
    prompt = await createPrompt.json();

    // Open UI and navigate to library
    await page.goto('/');
    await page.locator('button', { hasText: '資料庫' }).click();

    // Select the prompt from the list
    const promptItem = page.locator('h3', { hasText: prompt.title }).first();
    await promptItem.waitFor({ state: 'visible', timeout: 5000 });
    await promptItem.click();

    // Edit title in DetailPanel
    const titleInput = page.locator('label:has-text("標題")').locator('input[type="text"]');
    await titleInput.fill(`${prompt.title} - edited`);

    // Wait for autosave to complete
    await page.waitForSelector('text=已保存', { state: 'visible', timeout: 10000 });

    // Verify update persisted on backend
    const getPrompt = await request.get(`${backendBase}/api/prompts/${prompt.id}`);
    expect(getPrompt.status()).toBe(200);
    const updated = await getPrompt.json();
    expect(updated.title).toContain('edited');
  } finally {
    // Best-effort cleanup; ignore errors
    if (prompt?.id) {
      try { await request.delete(`${backendBase}/api/prompts/${prompt.id}`); } catch { }
    }
    if (project?.id) {
      try { await request.delete(`${backendBase}/api/projects/${project.id}`); } catch { }
    }
  }
});
