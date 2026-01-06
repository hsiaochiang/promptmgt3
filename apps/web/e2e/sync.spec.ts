import { test, expect } from '@playwright/test';

const backendBase = 'http://localhost:3001';

test('Sync: create a version node and list versions', async ({ request }) => {
  const now = Date.now();
  let project: any;

  try {
    // Create a project first
    const createRes = await request.post(`${backendBase}/api/projects`, {
      data: { title: `Sync Project ${now}` },
    });
    expect(createRes.status()).toBe(201);
    project = await createRes.json();

    // Create a version node for project
    const versionRes = await request.post(`${backendBase}/api/versions`, {
      data: { entityType: 'project', entityId: project.id, projectSlug: project.slug, message: 'initial version' },
    });
    expect(versionRes.status()).toBe(201);
    const versionEvent = await versionRes.json();
    // Accept either an event envelope or a version node object
    expect(versionEvent).toBeDefined();
    expect(versionEvent.id || versionEvent.event || versionEvent.data).toBeTruthy();

    // List versions for entity
    const listRes = await request.get(`${backendBase}/api/versions/project/${project.id}`);
    expect(listRes.status()).toBe(200);
    const events = await listRes.json();
    expect(Array.isArray(events)).toBeTruthy();
    expect(events.length).toBeGreaterThanOrEqual(1);
  } finally {
    // Cleanup: delete project
    if (project?.id) {
      await request.delete(`${backendBase}/api/projects/${project.id}`);
    }
  }
});
