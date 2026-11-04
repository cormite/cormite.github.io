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
      await page.waitForTimeout(800);
      // Deterministic: switch transitions off and show everything, instead of sleeping and hoping the animation ended.
      await page.evaluate(() => {
        const s = new CSSStyleSheet();
        s.replaceSync('html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important}.reveal{opacity:1!important;transform:none!important}');
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
        document.querySelectorAll('[data-aos]').forEach((n) => n.classList.add('is-visible'));
      });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
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

test.describe('analytics link classification', () => {
  // Absolute URLs only: a relative string resolves against the page's own host, which differs per environment.
  test('social platform is derived from the hostname, never from a substring', async ({ page }) => {
    await page.goto('/');
    const out = await page.evaluate(() => {
      const f = window.__SITE_INTERACTIONS.inferSocialPlatform;
      return {
        linkedin: f('https://www.linkedin.com/in/someone'),
        linkedinBare: f('https://linkedin.com/in/someone'),
        github: f('https://github.com/Cormite'),
        website: f('https://www.cormite.com/es/'),
        evilPath: f('https://evil.example/linkedin.com'),
        evilHost: f('https://notlinkedin.com/in/x'),
        evilSub: f('https://linkedin.com.evil.example/'),
        evilQuery: f('https://evil.example/?u=github.com'),
        unparseable: f('http://'),
        empty: f('')
      };
    });
    expect(out).toEqual({ linkedin: 'linkedin', linkedinBare: 'linkedin', github: 'github', website: 'website', evilPath: 'external', evilHost: 'external', evilSub: 'external', evilQuery: 'external', unparseable: 'external', empty: 'unknown' });
  });
});

test.describe('mobile regressions reported after the first release', () => {
  test('choosing analytics consent never scrolls the page', async ({ page }) => {
    for (const label of [/accept|aceptar|accetta/i, /decline|rechazar|rifiuta/i]) {
      await page.evaluate(() => localStorage.clear()).catch(() => {});
      await page.goto('/');
      await page.waitForTimeout(800);
      await expect(page.locator('#consent-banner')).toBeVisible();
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await page.locator('#consent-banner button', { hasText: label }).click();
      await page.waitForTimeout(700);
      expect(await page.evaluate(() => window.scrollY), `scrollY after ${label}`).toBeLessThan(5);
      await page.evaluate(() => localStorage.clear());
    }
  });

  test('reopening privacy settings from the footer moves focus to it without leaving the footer', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
    await page.goto('/');
    await page.locator('#privacy-settings-btn').scrollIntoViewIfNeeded();
    await page.locator('#privacy-settings-btn').click();
    await expect(page.locator('#consent-banner')).toBeVisible();
    await page.locator('#consent-banner button', { hasText: /decline|rechazar|rifiuta/i }).click();
    await expect(page.locator('#privacy-settings-btn')).toBeFocused();
    await expect(page.locator('#privacy-settings-btn')).toBeInViewport();
  });

  for (const path of PAGES) {
    test(`experience: each position's title is immediately followed by its own description on ${path}`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
      await page.goto(path);
      // Reading order in the page source (what screen readers, mobile layout and crawlers follow).
      const source = await page.evaluate(() => [...document.querySelectorAll('#experience-timeline > li')].map((li) => {
        const pos = (el) => { let n = 0; for (const x of li.querySelectorAll('*')) { n += 1; if (x === el) return n; } return -1; };
        return { h3: pos(li.querySelector('h3')), card: pos(li.querySelector('.hover-card')) };
      }));
      expect(source.length).toBeGreaterThanOrEqual(6);
      source.forEach((s, i) => expect(s.h3, `item ${i}: title must precede description in the source`).toBeLessThan(s.card));
    });
  }

  test('experience on mobile shows title then description for every position, in order', async ({ page, viewport }) => {
    test.skip(viewport.width >= 1024, 'mobile layout');
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
    await page.goto('/');
    await page.evaluate(() => document.querySelectorAll('[data-aos]').forEach((n) => n.classList.add('is-visible')));
    await page.waitForTimeout(900);
    const seq = await page.evaluate(() => {
      const out = [];
      for (const li of document.querySelectorAll('#experience-timeline > li')) {
        const h = li.querySelector('h3').getBoundingClientRect().top;
        const c = li.querySelector('.hover-card').getBoundingClientRect().top;
        out.push({ y: h + scrollY, kind: 'T' }, { y: c + scrollY, kind: 'D' });
      }
      return out.sort((a, b) => a.y - b.y).map((x) => x.kind).join('');
    });
    expect(seq).toBe('TD'.repeat(seq.length / 2));
  });

  test('experience on desktop keeps the alternating left/right layout', async ({ page, viewport }) => {
    test.skip(viewport.width < 1024, 'desktop layout');
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
    await page.goto('/');
    await page.evaluate(() => document.querySelectorAll('[data-aos]').forEach((n) => n.classList.add('is-visible')));
    await page.waitForTimeout(900);
    const sides = await page.evaluate(() => [...document.querySelectorAll('#experience-timeline > li')].map((li) => {
      const mid = innerWidth / 2;
      const h = li.querySelector('h3').getBoundingClientRect();
      const c = li.querySelector('.hover-card').getBoundingClientRect();
      return { title: h.left + h.width / 2 < mid ? 'L' : 'R', card: c.left + c.width / 2 < mid ? 'L' : 'R' };
    }));
    sides.forEach((s, i) => {
      expect(s.title, `item ${i} title side`).toBe(i % 2 === 0 ? 'L' : 'R');
      expect(s.card, `item ${i} description side`).toBe(i % 2 === 0 ? 'R' : 'L');
    });
  });
});
