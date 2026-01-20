import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3002',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run dev --workspace=apps/web',
    port: 3002,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
