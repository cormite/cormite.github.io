import { test, expect } from 'playwright/test';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

test.describe('uptime check', () => {
  test('fails loudly (exit 1) when the site cannot be reached', () => {
    // Port 9 on localhost refuses connections: fully offline and deterministic.
    const run = spawnSync(process.execPath, ['scripts/uptime-check.mjs'], {
      encoding: 'utf8', timeout: 120000,
      env: { ...process.env, UPTIME_SITE_URL: 'https://localhost:9', UPTIME_RETRY_MS: '0' }
    });
    expect(run.status).toBe(1);
    expect(run.stdout).toContain('FAIL');
    expect(run.stderr).toContain('UPTIME CHECK FAILED');
  });

  test('the scheduled workflow runs the script on a cron, can be started by hand, and holds no secrets', () => {
    const workflow = fs.readFileSync('.github/workflows/uptime.yml', 'utf8');
    expect(workflow).toMatch(/schedule:\s*\n\s*- cron: '[^']+'/);
    expect(workflow).toContain('workflow_dispatch');
    expect(workflow).toContain('node scripts/uptime-check.mjs');
    expect(workflow).not.toContain('secrets.');
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: read/);
  });

  test('checks the things that would silently break the identity', () => {
    const script = fs.readFileSync('scripts/uptime-check.mjs', 'utf8');
    for (const needle of ['verify-live', 'resolveMx', 'getPeerCertificate', 'security.txt', 'LEGACY_HOSTS']) expect(script).toContain(needle);
  });
});
