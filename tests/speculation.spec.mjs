import { test, expect } from 'playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Instant navigation: Cloudflare sends a Speculation-Rules header on the three pages and Chromium prerenders the next page
// on hover. Other browsers ignore it. Early Hints: the same pages send a Link header for the critical files.
test.use({ viewport: { width: 1440, height: 900 } });

const assemble = () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-'));
  execFileSync('node', ['scripts/assemble-site.mjs', '--cloudflare', '--out', out], { stdio: 'pipe' });
  return out;
};
const parse = (text) => {
  const rules = {}; let current = null;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    if (!line.startsWith(' ')) { current = line.trim(); rules[current] = {}; continue; }
    const i = line.indexOf(':'); rules[current][line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return rules;
};

test('production headers: speculation rules and Early Hints on every page, served with the right type', () => {
  const out = assemble();
  try {
    const rules = parse(fs.readFileSync(path.join(out, '_headers'), 'utf8'));
    for (const page of ['/', '/es/', '/it/']) {
      expect(rules[page]['Speculation-Rules'], page).toBe('"/assets/speculation-rules.json"');
      const link = rules[page].Link;
      expect(link, page).toMatch(/rel=preload; as=style/);
      expect(link, page).toMatch(/rel=preload; as=script/);
      expect(link, page).toMatch(/as=font; type=font\/woff2; crossorigin/);
      // Every preloaded file exists in the published output (a stale hash would be a 404 on every visit).
      for (const href of [...link.matchAll(/<([^>]+)>/g)].map((m) => m[1])) expect(fs.existsSync(path.join(out, href)), href).toBe(true);
    }
    expect(rules['/assets/speculation-rules.json']['Content-Type']).toBe('application/speculationrules+json');
    const spec = JSON.parse(fs.readFileSync(path.join(out, 'assets/speculation-rules.json'), 'utf8'));
    expect(spec.prerender[0].eagerness).toBe('moderate'); // on hover, not on page load: nothing is fetched unseen
    expect(JSON.stringify(spec)).toContain('/assets/*'); // never prerender files
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('Chromium accepts the rules from the header and finds pages to prerender', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'speculation rules are Chromium-only');
  // Playwright attaches DevTools, and Chromium then refuses to actually prerender ("PrerenderingDisabledByDevTools"),
  // so activation cannot be tested here. What can be proven: the browser parsed the rule set delivered by the header
  // without an error and turned it into candidate pages (the internal links).
  const rulesFile = fs.readFileSync('assets/speculation-rules.json', 'utf8');
  await page.route('**/assets/speculation-rules.json', (route) => route.fulfill({ status: 200, contentType: 'application/speculationrules+json', body: rulesFile }));
  await page.route(/\/(es\/|it\/)?$/, async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'speculation-rules': '"/assets/speculation-rules.json"' } });
  });
  const cdp = await page.context().newCDPSession(page);
  const ruleSets = []; const sources = [];
  cdp.on('Preload.ruleSetUpdated', (e) => ruleSets.push(e.ruleSet));
  cdp.on('Preload.preloadingAttemptSourcesUpdated', (e) => sources.push(...e.preloadingAttemptSources));
  await cdp.send('Preload.enable');
  await page.goto('/');
  await expect.poll(() => ruleSets.length, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(ruleSets.every((r) => !r.errorType), JSON.stringify(ruleSets.map((r) => r.errorMessage))).toBe(true);
  await expect.poll(() => sources.length, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(sources.map((s) => `${s.key.action}`).every((a) => /prerender/i.test(a)), JSON.stringify(sources[0])).toBe(true);
});
