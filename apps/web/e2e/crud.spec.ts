import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('CRUD: projects and prompts via API', async ({ request }) => {
  const now = Date.now();
  let project: any;
  let prompt: any;

  try {
    // Create project
      // Create project and prompt via API (setup)
      const createProject = await request.post(`${backendBase}/api/projects`, { data: { title: `UI Project ${now}` } });
      expect(createProject.status()).toBe(201);
      const project = await createProject.json();

      const createPrompt = await request.post(`${backendBase}/api/prompts`, { data: { title: `UI Prompt ${now}`, projectId: project.id, body: 'initial body' } });
      expect(createPrompt.status()).toBe(201);
      const prompt = await createPrompt.json();

      // Open the app UI
      await page.goto('/');

      // Click Sidebar -> 資料庫
      await page.locator('button', { hasText: '資料庫' }).click();

      // Wait for prompt list to load and click the prompt item by title
      const promptItem = page.locator('h3', { hasText: prompt.title });
      await promptItem.first().waitFor({ state: 'visible', timeout: 3000 });
      await promptItem.first().click();

      // DetailPanel should open - change the title input
      const titleInput = page.locator('label:has-text("標題")').locator('input[type="text"]');
      await titleInput.fill(`${prompt.title} - edited`);

      // Wait for autosave indicator: 保存中… then 已保存
      await page.waitForSelector('text=保存中…', { state: 'visible', timeout: 2000 });
      await page.waitForSelector('text=已保存', { state: 'visible', timeout: 5000 });

      // Verify backend shows updated title
      const getPrompt = await request.get(`${backendBase}/api/prompts/${prompt.id}`);
      expect(getPrompt.status()).toBe(200);
      const updated = await getPrompt.json();
      expect(updated.title).toContain('edited');

      // Cleanup: delete prompt and project via API
      await request.delete(`${backendBase}/api/prompts/${prompt.id}`);
      await request.delete(`${backendBase}/api/projects/${project.id}`);
  } finally {
    // Cleanup: Delete prompt if created
    if (prompt?.id) {
      const delPromptRes = await request.delete(`${backendBase}/api/prompts/${prompt.id}`);
      expect(delPromptRes.status()).toBe(200);
    }
    // Cleanup: Delete project if created
    if (project?.id) {
      const delProjectRes = await request.delete(`${backendBase}/api/projects/${project.id}`);
      expect(delProjectRes.status()).toBe(200);
    }
  }
});
