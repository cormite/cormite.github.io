import fs from 'node:fs';
import { defineConfig } from 'playwright/test';

// PW_CHANNEL=chrome uses locally installed Google Chrome (no browser download).
const channel = process.env.PW_CHANNEL || undefined;
// Tests use their own port so they never collide with a preview server (npm run serve uses 4173).
const TEST_PORT = 4174;
const baseURL = process.env.BASE_URL || `http://localhost:${TEST_PORT}`;

// Spec files that do not depend on the viewport (file checks, headers, explicit viewport sizes inside the test) run once
// in the "once" project instead of twice. Everything else runs in both the desktop and the mobile project.
const RUN_ONCE = [
  /headers\.spec/, /domain\.spec/, /discoverability\.spec/, /uptime\.spec/, /staging-gate\.spec/,
  /portrait\.spec/, /portrait-transition\.spec/, /mobile-menu\.spec/, /ci-config\.spec/, /scripts-safety\.spec/
];

// CI runs the suite as parallel jobs, one per TEST_GROUP (see .github/workflows/ci.yml). Groups are balanced by measured
// run time (the pixel-measuring contrast, quality and palette files are the slow ones). Any spec file not listed here
// falls into the automatic "rest" group, so a new test file is always run by exactly one CI job and can never be skipped.
// Without TEST_GROUP (local runs) everything runs.
const GROUPS = {
  contrast: [/contrast\.spec/],
  quality: [/quality\.spec/],
  ui: [/palette\.spec/, /a11y\.spec/],
  media: [/portrait\.spec/, /portrait-transition\.spec/, /transitions\.spec/, /performance\.spec/, /mobile-menu\.spec/]
};
const NEVER = /^$/; // an empty testMatch list would mean "everything", so use a pattern that matches nothing
const group = process.env.TEST_GROUP;
if (group && group !== 'rest' && !GROUPS[group]) throw new Error(`Unknown TEST_GROUP "${group}"; use ${[...Object.keys(GROUPS), 'rest'].join(', ')}`);
const specFiles = fs.readdirSync('./tests').filter((file) => file.endsWith('.spec.mjs'));
const groupOf = (file) => Object.keys(GROUPS).find((name) => GROUPS[name].some((re) => re.test(file))) || 'rest';
const selected = specFiles.filter((file) => !group || groupOf(file) === group);
const matching = (files) => (files.length ? files.map((file) => new RegExp(`${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)) : [NEVER]);
const onceFiles = selected.filter((file) => RUN_ONCE.some((re) => re.test(file)));
const bothFiles = selected.filter((file) => !RUN_ONCE.some((re) => re.test(file)));

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  // Tests inside a file run in parallel too, so the slow pixel-measuring files do not serialise one worker.
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, channel, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', testMatch: matching(bothFiles), use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', testMatch: matching(bothFiles), use: { viewport: { width: 390, height: 844 } } },
    { name: 'once', testMatch: matching(onceFiles), use: { viewport: { width: 1440, height: 900 } } }
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: `PORT=${TEST_PORT} node scripts/serve.mjs`,
    url: `http://localhost:${TEST_PORT}`,
    reuseExistingServer: false
  }
});
