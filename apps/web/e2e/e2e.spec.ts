import { test, expect } from '@playwright/test';

test('homepage loads and workspace settings available', async ({ page, request }) => {
  // Visit homepage
  await page.goto('/');
  await expect(page).toHaveTitle(/Prompt Asset Hub|Prompt/);

  // If there is a search box, try to interact; otherwise call API directly
  const searchInput = await page.$('input[type="search"], input[name="q"]');
  if (searchInput) {
    await searchInput.fill('test');
    await searchInput.press('Enter');
    // Wait for results list
    await page.waitForTimeout(500);
  } else {
    // fallback: call search API directly (backend)
    const backendBase = 'http://localhost:3001';
    const res = await request.get(`${backendBase}/api/search?q=test`);
    expect([200, 204, 404]).toContain(res.status());
  }

  // Navigate to settings page (try common selector)
  const settingsLink = await page.$('a[href*="settings"], [data-testid="settings-link"]');
  if (settingsLink) {
    await settingsLink.click();
    await page.waitForLoadState('networkidle');
    // Expect an element that contains rootPath
    const rootPathText = await page.$('text=Root path, text=rootPath, text=rootPath');
    expect(rootPathText).not.toBeNull();
  } else {
    // fallback: call backend API directly
    const backendBase = 'http://localhost:3001';
    const res = await request.get(`${backendBase}/api/workspace/settings`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.rootPath).toBeDefined();
  }
});
