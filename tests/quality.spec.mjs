import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/es/', '/it/'];

test.describe('layout stability under a realistic connection', () => {
  for (const path of PAGES) {
    test(`total layout shift stays within budget on ${path}`, async ({ browser, baseURL, viewport }) => {
      // Web fonts arrive after first paint for real visitors; emulate that so font-swap shifts are measurable.
      const ctx = await browser.newContext({ baseURL, viewport });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 120, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(path, { waitUntil: 'load' });
      await page.waitForTimeout(3500);
      const cls = await page.evaluate(() => window.__cls);
      // The metric-matched fallback is calibrated for Georgia (macOS, iOS, Windows). On machines without it
      // (typical Linux CI) the generic serif is used, so the official "good" Core Web Vitals limit applies.
      const hasGeorgia = await page.evaluate(() => {
        const c = document.createElement('canvas').getContext('2d');
        const w = (f) => { c.font = `40px ${f}`; return c.measureText('Hamburgefonstiv 0123').width; };
        return w('Georgia, monospace') !== w('monospace');
      });
      await ctx.close();
      const budget = hasGeorgia ? 0.02 : 0.1;
      expect(cls, `CLS on ${path} (Georgia ${hasGeorgia ? 'present' : 'absent'}, budget ${budget})`).toBeLessThan(budget);
    });
  }

  test('all four web fonts are preloaded so they arrive together', async ({ page }) => {
    await page.goto('/');
    const preloaded = await page.evaluate(() => [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((l) => new URL(l.href).pathname.split('/').pop()));
    expect(preloaded.sort()).toEqual([
      'cormorant-garamond-latin-600-normal.woff2',
      'eb-garamond-latin-400-normal.woff2',
      'eb-garamond-latin-600-normal.woff2',
      'eb-garamond-latin-700-normal.woff2'
    ]);
  });

  test('every web font has a metric-matched fallback face', async ({ page }) => {
    await page.goto('/');
    const faces = await page.evaluate(() => [...document.fonts].map((f) => f.family.replace(/"/g, '')));
    expect(faces).toContain('EB Garamond Fallback');
    expect(faces).toContain('Cormorant Garamond Fallback');
  });
});

test.describe('icons and manifest', () => {
  test('favicon set is declared, non-empty and valid', async ({ page, request }) => {
    await page.goto('/');
    const links = await page.evaluate(() => [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')].map((l) => ({ rel: l.rel, href: l.href, sizes: l.sizes ? l.sizes.value : '', type: l.type })));
    const rels = links.map((l) => l.rel);
    expect(rels).toContain('apple-touch-icon');
    expect(rels).toContain('manifest');
    expect(links.filter((l) => /icon/.test(l.rel) && l.rel !== 'apple-touch-icon').length).toBeGreaterThanOrEqual(2);
    for (const l of links) {
      const res = await request.get(l.href);
      expect(res.status(), l.href).toBe(200);
      expect((await res.body()).length, `${l.href} must not be empty`).toBeGreaterThan(100);
    }
  });

  test('legacy /favicon.ico is a real icon', async ({ request }) => {
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(200);
    const body = await res.body();
    expect(body.length).toBeGreaterThan(300);
    expect(body.readUInt16LE(0)).toBe(0); // ICO header: reserved
    expect(body.readUInt16LE(2)).toBe(1); // ICO header: type 1 = icon
  });

  test('web manifest is valid', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.locator('link[rel="manifest"]').evaluate((l) => l.href);
    const m = await (await request.get(href)).json();
    expect(m.name).toMatch(/Carlos/);
    expect(m.theme_color).toBe('#0B1B3D');
    expect(m.icons.length).toBeGreaterThanOrEqual(2);
    for (const icon of m.icons) expect((await request.get(new URL(icon.src, href).href)).status()).toBe(200);
  });
});

test.describe('markup correctness', () => {
  for (const path of PAGES) {
    test(`axe reports zero violations of any impact on ${path}`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
      await page.goto(path);
      await page.waitForTimeout(2200);
      await page.evaluate(() => document.querySelectorAll('[data-aos]').forEach((n) => n.classList.add('is-visible')));
      await page.waitForTimeout(900);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      const summary = results.violations.map((v) => `${v.id} [${v.impact}] x${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.html.slice(0, 70)).join(' | ')}`);
      expect(summary).toEqual([]);
    });
  }

  test('labelled wrapper elements carry a role (no aria-label on role-less divs)', async ({ page }) => {
    await page.goto('/');
    const bad = await page.evaluate(() => [...document.querySelectorAll('div[aria-label]:not([role]), span[aria-label]:not([role])')].map((e) => e.id || e.className.toString().slice(0, 40)));
    expect(bad).toEqual([]);
  });

  test('lists use real list semantics', async ({ page }) => {
    await page.goto('/');
    const roles = await page.evaluate(() => [...document.querySelectorAll('[role="listitem"]')].map((e) => e.tagName));
    expect(roles.filter((t) => t === 'ARTICLE')).toEqual([]);
    for (const id of ['experience-timeline', 'achievements-grid', 'skills-grid']) {
      const tag = await page.locator('#' + id).evaluate((e) => e.tagName);
      expect(tag, id).toBe('UL');
    }
  });
});

test.describe('hero badges', () => {
  test('text never pokes outside its rounded badge shape', async ({ page, viewport }) => {
    test.skip(viewport.width < 1024, 'badges float around the photo on desktop only');
    await page.goto('/');
    await page.waitForTimeout(1500);
    const outside = await page.evaluate(() => [...document.querySelectorAll('.hero-badge')].map((li) => {
      const r = li.getBoundingClientRect();
      const rad = parseFloat(getComputedStyle(li).borderTopLeftRadius);
      const rr = Math.min(rad, r.height / 2, r.width / 2);
      const sp = li.firstElementChild.getBoundingClientRect();
      const corners = [[sp.left, sp.top], [sp.right, sp.top], [sp.left, sp.bottom], [sp.right, sp.bottom]];
      const centres = [[r.left + rr, r.top + rr], [r.right - rr, r.top + rr], [r.left + rr, r.bottom - rr], [r.right - rr, r.bottom - rr]];
      let n = 0;
      corners.forEach(([x, y], i) => {
        const [cx, cy] = centres[i];
        const inZone = (i % 2 === 0 ? x < cx : x > cx) && (i < 2 ? y < cy : y > cy);
        if (inZone && Math.hypot(x - cx, y - cy) > rr) n += 1;
      });
      return n ? `${li.textContent.trim().slice(0, 20)} (${n})` : null;
    }).filter(Boolean));
    expect(outside).toEqual([]);
  });
});

test.describe('search snippets', () => {
  const seen = new Set();
  for (const path of PAGES) {
    test(`title is at most 60 and description 110-160 characters on ${path}`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(title.length, title).toBeLessThanOrEqual(60);
      expect(desc.length, desc).toBeGreaterThanOrEqual(110);
      expect(desc.length, desc).toBeLessThanOrEqual(160);
      expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBe(title);
      expect(seen.has(title)).toBe(false);
      seen.add(title);
    });
  }
});
