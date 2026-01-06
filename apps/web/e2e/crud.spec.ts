import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('CRUD: projects and prompts via API', async ({ request }) => {
  const now = Date.now();
  // Create project
  const createRes = await request.post(`${backendBase}/api/projects`, {
    data: { title: `E2E Project ${now}`, summary: 'created by e2e' },
  });
  expect(createRes.status()).toBe(201);
  const project = await createRes.json();
  expect(project.id).toBeDefined();
  expect(project.slug).toBeDefined();

  // List projects
  const listRes = await request.get(`${backendBase}/api/projects`);
  expect(listRes.status()).toBe(200);
  const projects = await listRes.json();
  expect(Array.isArray(projects)).toBeTruthy();
  expect(projects.find((p: any) => p.id === project.id)).toBeTruthy();

  // Update project
  const updatedTitle = `E2E Project ${now} - updated`;
  const updateRes = await request.put(`${backendBase}/api/projects/${project.id}`, {
    data: { title: updatedTitle },
  });
  expect(updateRes.status()).toBe(200);
  const updated = await updateRes.json();
  expect(updated.title).toBe(updatedTitle);

  // Create prompt under project
  const createPromptRes = await request.post(`${backendBase}/api/prompts`, {
    data: { title: `E2E Prompt ${now}`, projectId: project.id, body: 'prompt body' },
  });
  expect(createPromptRes.status()).toBe(201);
  const prompt = await createPromptRes.json();
  expect(prompt.id).toBeDefined();

  // Get prompt via list
  const promptsRes = await request.get(`${backendBase}/api/prompts`);
  expect(promptsRes.status()).toBe(200);
  const prompts = await promptsRes.json();
  expect(prompts.find((p: any) => p.id === prompt.id)).toBeTruthy();

  // Delete prompt
  const delPromptRes = await request.delete(`${backendBase}/api/prompts/${prompt.id}`);
  expect(delPromptRes.status()).toBe(200);

  // Delete project (archive)
  const delProjectRes = await request.delete(`${backendBase}/api/projects/${project.id}`);
  expect(delProjectRes.status()).toBe(200);
});
