import { test, expect } from 'playwright/test';
import zlib from 'node:zlib';

// Performance budget: deterministic limits on bytes, requests and loading behaviour of the first visit.
// Sizes are the compressed (gzip level 9) size of text files and the raw size of already-compressed files (fonts, images),
// which is what a CDN sends. Timing (LCP, CLS) is not asserted here: it is machine-dependent; CLS has its own test.
// Current numbers (2026-11-05): 9 requests, about 152 KB in total. Each limit has roughly 30% headroom, so a real
// regression fails CI while normal content edits do not. Raise a limit only on purpose, in a commit that says why.
const BUDGET = Object.freeze({
  totalKB: 200,
  requests: 12,
  htmlKB: 18,
  jsKB: 30,
  cssKB: 11,
  fontsKB: 110,
  fontFiles: 4,
  imagesKB: 25
});
const kb = (bytes) => bytes / 1024;
const isText = (type) => /text|javascript|json|svg|xml/.test(type);

async function firstVisit(page, path) {
  const rows = [];
  const pending = [];
  page.on('response', (response) => pending.push((async () => {
    try {
      const body = await response.body();
      const type = (response.headers()['content-type'] || '').split(';')[0];
      const url = new URL(response.url());
      rows.push({ host: url.hostname, path: url.pathname, type, bytes: isText(type) ? zlib.gzipSync(body, { level: 9 }).length : body.length });
    } catch { /* redirects have no body */ }
  })()));
  await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
  await page.goto(path, { waitUntil: 'networkidle' });
  await Promise.all(pending);
  return rows;
}

for (const path of ['/', '/es/', '/it/']) {
  test.describe(`performance budget ${path}`, () => {
    test('first visit stays within the byte and request budget', async ({ page }) => {
      const rows = await firstVisit(page, path);
      const sum = (filter) => rows.filter(filter).reduce((total, r) => total + r.bytes, 0);
      const report = rows.map((r) => `${r.type} ${r.bytes} ${r.path}`).join('\n');

      expect(rows.length, `requests\n${report}`).toBeLessThanOrEqual(BUDGET.requests);
      expect(kb(sum(() => true)), `total\n${report}`).toBeLessThanOrEqual(BUDGET.totalKB);
      expect(kb(sum((r) => r.type === 'text/html')), 'HTML').toBeLessThanOrEqual(BUDGET.htmlKB);
      expect(kb(sum((r) => /javascript/.test(r.type))), 'JavaScript').toBeLessThanOrEqual(BUDGET.jsKB);
      expect(kb(sum((r) => r.type === 'text/css')), 'CSS').toBeLessThanOrEqual(BUDGET.cssKB);
      expect(kb(sum((r) => /^font\//.test(r.type))), 'fonts').toBeLessThanOrEqual(BUDGET.fontsKB);
      expect(rows.filter((r) => /^font\//.test(r.type)).length, 'font files').toBeLessThanOrEqual(BUDGET.fontFiles);
      expect(kb(sum((r) => /\.(avif|webp|jpe?g|png)$/.test(r.path))), 'images').toBeLessThanOrEqual(BUDGET.imagesKB);
    });

    test('before consent nothing is requested from any other host', async ({ page }) => {
      const rows = await firstVisit(page, path);
      const own = new URL(page.url()).hostname;
      expect(rows.filter((r) => r.host !== own).map((r) => r.host)).toEqual([]);
    });
  });
}

test.describe('loading behaviour', () => {
  test('one stylesheet, scripts deferred, hero image prioritised, no render-blocking third parties', async ({ page }) => {
    await page.goto('/');
    const facts = await page.evaluate(() => ({
      stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href')),
      blockingScripts: [...document.querySelectorAll('script[src]')].filter((s) => !s.defer && !s.async && s.type !== 'module').map((s) => s.src),
      heroPriority: document.querySelector('#home img')?.getAttribute('fetchpriority'),
      heroLazy: document.querySelector('#home img')?.getAttribute('loading')
    }));
    expect(facts.stylesheets).toHaveLength(1);
    expect(facts.blockingScripts).toEqual([]);
    expect(facts.heroPriority).toBe('high');
    expect(facts.heroLazy).not.toBe('lazy');
    // Third-party hosts may only appear as canonical/alternate links (same site), never as scripts or stylesheets.
    const external = await page.evaluate(() => [...document.head.querySelectorAll('script[src], link[rel="stylesheet"], link[rel="preload"]')]
      .map((n) => n.getAttribute('href') || n.getAttribute('src')).filter((u) => /^https?:\/\//.test(u) && new URL(u).hostname !== location.hostname));
    expect(external).toEqual([]);
  });

  test('bundles are content-hashed so they can be cached for a year', async ({ page }) => {
    await page.goto('/');
    const names = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"], script[src]')].map((n) => n.getAttribute('href') || n.getAttribute('src')));
    for (const name of names) expect(name, 'bundles must be content-hashed').toMatch(/\.[0-9a-f]{10}\.(js|css)$/);
  });
});
