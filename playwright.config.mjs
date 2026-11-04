import { defineConfig } from 'playwright/test';

// PW_CHANNEL=chrome uses locally installed Google Chrome (no browser download).
const channel = process.env.PW_CHANNEL || undefined;
// Tests use their own port so they never collide with a preview server (npm run serve uses 4173).
const TEST_PORT = 4174;
const baseURL = process.env.BASE_URL || `http://localhost:${TEST_PORT}`;

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
    command: `PORT=${TEST_PORT} node scripts/serve.mjs`,
    url: `http://localhost:${TEST_PORT}`,
    reuseExistingServer: false
  }
});
