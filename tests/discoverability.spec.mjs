import { test, expect } from 'playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { productionHeaders } from '../scripts/security-headers.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const sandbox = { globalThis: {}, console };
sandbox.globalThis = sandbox;
vm.runInNewContext(read('assets/js/site-content.js'), sandbox);
const { SITE_CONFIG, CV_FILES } = sandbox.__SITE_CONTENT;
const HOST = SITE_CONFIG.siteHost;

test.describe('security.txt (RFC 9116)', () => {
  const text = read('.well-known/security.txt');
  const field = (name) => (text.match(new RegExp(`^${name}: (.+)$`, 'm')) || [])[1];

  test('has a Contact on the site domain, a Canonical URL and languages', () => {
    expect(field('Contact')).toBe(`mailto:security@${HOST}`);
    expect(field('Canonical')).toBe(`${SITE_CONFIG.siteUrl}/.well-known/security.txt`);
    expect(field('Preferred-Languages')).toBe('en, es, it');
  });

  test('Expires is a valid UTC timestamp, in the future, and not within 30 days of expiry', () => {
    const expires = field('Expires');
    expect(expires).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    const left = new Date(expires).getTime() - Date.now();
    // Every release rebuilds the file with a fresh one-year expiry (docs/RELEASE.md). This fails when nobody has
    // released for about eleven months, which is the reminder to renew it.
    expect(left, `security.txt expires ${expires}: rebuild (npm run build) and release to renew`).toBeGreaterThan(30 * 24 * 3600 * 1000);
  });
});

test.describe('llms.txt', () => {
  const text = read('llms.txt');

  test('is generated from the site content and uses the configured domain only', () => {
    expect(text.startsWith(`# ${SITE_CONFIG.siteName}`)).toBe(true);
    for (const url of text.match(/https?:\/\/[^\s)]+/g)) {
      const host = new URL(url).hostname;
      expect(['linkedin.com', 'github.com', HOST], `unexpected host in llms.txt: ${url}`).toContain(host);
    }
    expect(text).toContain(`${SITE_CONFIG.siteUrl}/es/`);
    expect(text).toContain(`${SITE_CONFIG.siteUrl}/it/`);
    for (const file of Object.values(CV_FILES)) expect(text).toContain(`${SITE_CONFIG.siteUrl}/${file}`);
  });

  test('every CV file it links to exists, and it does not assume anyone\'s pronouns', () => {
    for (const file of Object.values(CV_FILES)) expect(fs.existsSync(path.join(root, file))).toBe(true);
    expect(text).not.toMatch(/\b(he|him|his|himself|she|her|hers|herself)\b/i);
  });
});

test.describe('publishing', () => {
  test('production headers give both files a text/plain charset and a short cache', () => {
    const headers = productionHeaders();
    for (const file of ['/llms.txt', '/.well-known/security.txt']) {
      const block = headers.split('\n\n').find((b) => b.startsWith(file)) || '';
      expect(block, `no header block for ${file}`).toContain('Content-Type: text/plain; charset=utf-8');
      expect(block).toMatch(/Cache-Control: public, max-age=\d+/);
    }
  });

  const assemble = (flag) => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'site-'));
    execFileSync('node', ['scripts/assemble-site.mjs', ...(flag ? [flag] : []), '--out', out], { cwd: root, stdio: 'pipe' });
    return out;
  };

  test('Cloudflare layout publishes both files (including the dot-folder) and no .nojekyll', () => {
    const out = assemble('--cloudflare');
    expect(fs.existsSync(path.join(out, '.well-known', 'security.txt'))).toBe(true);
    expect(fs.existsSync(path.join(out, 'llms.txt'))).toBe(true);
    expect(fs.existsSync(path.join(out, '.nojekyll'))).toBe(false);
  });

  test('GitHub Pages rollback layout publishes both files and .nojekyll so the dot-folder is served', () => {
    const out = assemble();
    expect(fs.existsSync(path.join(out, '.well-known', 'security.txt'))).toBe(true);
    expect(fs.existsSync(path.join(out, 'llms.txt'))).toBe(true);
    expect(fs.existsSync(path.join(out, '.nojekyll'))).toBe(true);
  });

  test('private staging never publishes them', () => {
    const out = assemble('--staging');
    expect(fs.existsSync(path.join(out, '.well-known'))).toBe(false);
    expect(fs.existsSync(path.join(out, 'llms.txt'))).toBe(false);
  });

  test('post-deploy verification covers both files', () => {
    const script = read('scripts/verify-live.mjs');
    expect(script).toContain('/llms.txt');
    expect(script).toContain('/.well-known/security.txt');
    expect(script).toContain('Expires');
  });
});
