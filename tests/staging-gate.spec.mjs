import { test, expect } from 'playwright/test';
import fs from 'node:fs';

// functions/_middleware.js is an ES module for Cloudflare, but this repo's package type is commonjs,
// so load its source as a data: module instead of importing the path.
const source = fs.readFileSync(new URL('../functions/_middleware.js', import.meta.url), 'utf8');
const { onRequest } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

const call = (headers = {}, env = { STAGING_PASSWORD: 'correct horse battery staple' }) =>
  onRequest({
    request: new Request('https://staging.example/', { headers }),
    env,
    next: async () => new Response('SECRET SITE', { status: 200, headers: { 'Content-Type': 'text/html' } })
  });

const basic = (user, pass) => ({ Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') });

test.describe('staging password gate (Pages Function)', () => {
  test('fails closed when no password is configured', async () => {
    const res = await call({}, {});
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain('SECRET');
  });

  test('requires credentials', async () => {
    const res = await call();
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toMatch(/^Basic /);
    expect(await res.text()).not.toContain('SECRET');
  });

  test('rejects a wrong password, empty password and malformed header', async () => {
    for (const headers of [basic('x', 'wrong'), basic('x', ''), { Authorization: 'Basic !!!notbase64' }, { Authorization: 'Bearer abc' }]) {
      const res = await call(headers);
      expect(res.status, JSON.stringify(headers)).toBe(401);
      expect(await res.text()).not.toContain('SECRET');
    }
  });

  test('accepts the right password with any username, and never caches', async () => {
    const res = await call(basic('anyone', 'correct horse battery staple'));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('SECRET SITE');
    expect(res.headers.get('cache-control')).toMatch(/no-store/);
  });

  test('passwords containing colons work', async () => {
    const res = await call(basic('u', 'a:b:c'), { STAGING_PASSWORD: 'a:b:c' });
    expect(res.status).toBe(200);
  });

  test('is excluded from the production layout', async () => {
    const { execFileSync } = await import('node:child_process');
    execFileSync('node', ['scripts/assemble-site.mjs', '--out', '/tmp/gate-prod-check']);
    expect(fs.existsSync('/tmp/gate-prod-check/functions')).toBe(false);
  });
});
