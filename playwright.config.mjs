import { defineConfig } from 'playwright/test';

// PW_CHANNEL=chrome uses locally installed Google Chrome (no browser download).
const channel = process.env.PW_CHANNEL || undefined;
const baseURL = process.env.BASE_URL || 'http://localhost:4173';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, channel, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: 'node scripts/serve.mjs',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI
  }
});
