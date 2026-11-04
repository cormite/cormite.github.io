import { test, expect } from 'playwright/test';

const PAGES = [
  { path: '/', lang: 'en' },
  { path: '/es/', lang: 'es' },
  { path: '/it/', lang: 'it' }
];
// Third-party hosts the site is allowed to contact (analytics only).
const ALLOWED_EXTERNAL = [/googletagmanager\.com/, /google-analytics\.com/, /analytics\.google\.com/, /doubleclick\.net/];

for (const { path, lang } of PAGES) {
  test.describe(`page ${path}`, () => {
    test('loads without console errors or failed local requests', async ({ page, baseURL }) => {
      const errors = [];
      const failed = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('requestfailed', (r) => {
        if (r.url().startsWith(baseURL)) failed.push(r.url());
      });
      const res = await page.goto(path, { waitUntil: 'load' });
      expect(res.status()).toBe(200);
      expect(failed).toEqual([]);
      // Analytics may be blocked in CI sandboxes; ignore network errors from third parties.
      const real = errors.filter((e) => !/ERR_|Failed to load resource|googletagmanager|google-analytics/i.test(e));
      expect(real).toEqual([]);
    });

    test('has correct language, single h1, title and SEO tags', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveCount(1);
      expect((await page.title()).length).toBeGreaterThan(10);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(() => JSON.parse(ld)).not.toThrow();
    });

    test('all in-page anchors resolve and images have alt text', async ({ page }) => {
      await page.goto(path);
      const missing = await page.evaluate(() =>
        [...document.querySelectorAll('a[href*="#"]')]
          .map((a) => new URL(a.href, location.href))
          .filter((u) => u.pathname === location.pathname && u.hash.length > 1)
          .filter((u) => !document.getElementById(u.hash.slice(1)))
          .map((u) => u.hash));
      expect(missing).toEqual([]);
      const noAlt = await page.locator('img:not([alt])').count();
      expect(noAlt).toBe(0);
    });

    test('no horizontal overflow (before and after reveal)', async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('contacts only allowed third-party hosts', async ({ page, baseURL }) => {
      const external = new Set();
      page.on('request', (r) => {
        const u = new URL(r.url());
        if (!r.url().startsWith(baseURL) && u.protocol.startsWith('http')) external.add(u.host);
      });
      await page.goto(path, { waitUntil: 'load' });
      const bad = [...external].filter((h) => !ALLOWED_EXTERNAL.some((re) => re.test(h)));
      expect(bad).toEqual([]);
    });
  });
}

test('CV PDFs are reachable', async ({ request }) => {
  for (const l of ['en', 'es', 'it']) {
    const res = await request.get(`/carlos-fernandez-san-millan-${l}.pdf`);
    expect(res.status()).toBe(200);
  }
});

test('robots.txt and sitemap.xml are served', async ({ request }) => {
  expect((await request.get('/robots.txt')).status()).toBe(200);
  const sm = await request.get('/sitemap.xml');
  expect(sm.status()).toBe(200);
  expect(await sm.text()).toContain('<urlset');
});

test('mobile menu opens and closes (Escape)', async ({ page, isMobile, viewport }) => {
  test.skip(viewport.width >= 768, 'mobile-only');
  await page.goto('/');
  await page.locator('#mobile-menu-btn').click();
  await expect(page.locator('#mobile-menu')).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toHaveAttribute('aria-hidden', 'true');
});

test('scroll-reveal and hero float animations work over http', async ({ page, viewport }) => {
  test.skip(viewport.width < 768, 'desktop-only layout check');
  await page.goto('/');
  const total = await page.locator('[data-aos]').count();
  expect(total).toBeGreaterThan(15);
  // Below-the-fold elements start hidden, then reveal after scrolling.
  const before = await page.locator('[data-aos].is-visible').count();
  expect(before).toBeLessThan(total);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.locator('[data-aos].is-visible').count()).toBeGreaterThan(before);
  const anim = await page.locator('.hero-badge').first().evaluate((e) => getComputedStyle(e).animationName);
  expect(anim).toBe('float');
});

test('mobile hamburger button sits inside the navbar row', async ({ page, viewport }) => {
  test.skip(viewport.width >= 768, 'mobile-only');
  await page.goto('/');
  const nav = await page.locator('#navbar').boundingBox();
  const btn = await page.locator('#mobile-menu-btn').boundingBox();
  expect(nav.height).toBeLessThanOrEqual(90);
  expect(btn.y + btn.height).toBeLessThanOrEqual(nav.y + nav.height);
  expect(btn.x).toBeGreaterThan(viewport.width / 2);
});

/* ------------------------------------------------------------------ */
/* Phase 2-5 regression tests: privacy, security, performance, a11y    */
/* ------------------------------------------------------------------ */

const GA_HOST = /googletagmanager\.com|google-analytics\.com/;

test.describe('privacy and security', () => {
  test('no Google Analytics request before consent; banner is shown', async ({ page }) => {
    const ga = [];
    page.on('request', (r) => { if (GA_HOST.test(r.url())) ga.push(r.url()); });
    await page.goto('/');
    await expect(page.locator('#consent-banner')).toBeVisible();
    await page.waitForTimeout(800);
    expect(ga).toEqual([]);
    expect(await page.evaluate(() => typeof window.gtag)).toBe('undefined');
  });

  test('declining persists and never loads analytics', async ({ page }) => {
    const ga = [];
    page.on('request', (r) => { if (GA_HOST.test(r.url())) ga.push(r.url()); });
    await page.goto('/');
    await page.locator('#consent-banner button', { hasText: /decline/i }).click();
    await expect(page.locator('#consent-banner')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('#consent-banner')).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(ga).toEqual([]);
  });

  test('accepting loads analytics with consent mode defaults denied', async ({ page }) => {
    const ga = [];
    page.on('request', (r) => { if (GA_HOST.test(r.url())) ga.push(r.url()); });
    await page.route(GA_HOST, (route) => route.abort());
    await page.goto('/');
    await page.locator('#consent-banner button', { hasText: /accept/i }).click();
    await expect.poll(() => ga.length).toBeGreaterThan(0);
    const dl = await page.evaluate(() => window.dataLayer.map((e) => Array.from(e).slice(0, 3)));
    const def = dl.find((e) => e[0] === 'consent' && e[1] === 'default');
    expect(def[2]).toMatchObject({ ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
  });

  test('privacy settings can be reopened from the footer', async ({ page }) => {
    await page.goto('/');
    await page.locator('#consent-banner button', { hasText: /decline/i }).click();
    await page.locator('#privacy-settings-btn').click();
    await expect(page.locator('#consent-banner')).toBeVisible();
  });

  test('CSP is present, with no inline scripts and no unsafe-eval', async ({ page }) => {
    await page.goto('/');
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    const inline = await page.evaluate(() => [...document.scripts].filter((s) => !s.src && s.type !== 'application/ld+json').length);
    expect(inline).toBe(0);
  });
});

test.describe('performance and assets', () => {
  test('one hashed JS bundle and one hashed CSS bundle', async ({ page }) => {
    await page.goto('/');
    const scripts = await page.evaluate(() => [...document.scripts].filter((s) => s.src).map((s) => new URL(s.src).pathname));
    const sheets = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.href).pathname));
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toMatch(/\/assets\/dist\/app\.[0-9a-f]{10}\.js$/);
    expect(sheets).toHaveLength(1);
    expect(sheets[0]).toMatch(/\/assets\/dist\/site\.[0-9a-f]{10}\.css$/);
  });

  test('page is pre-rendered and the client does not re-render it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-prerendered', 'true');
    expect(await page.locator('svg.icon').count()).toBeGreaterThan(5);
    expect(await page.locator('i.fas, i.fab').count()).toBe(0);
  });

  test('responsive portrait loads (AVIF/WebP) and is not upscaled', async ({ page }) => {
    await page.goto('/');
    const info = await page.locator('#home img').evaluate((img) => ({ src: img.currentSrc, w: img.naturalWidth, shown: img.getBoundingClientRect().width }));
    expect(info.w).toBeGreaterThan(0);
    expect(info.src).toMatch(/assets\/img\/photo-\d+\.(avif|webp|jpg)$/);
    expect(info.w).toBeLessThanOrEqual(881);
  });

  test('social card meta points to an existing 1200x630 image', async ({ page, request }) => {
    await page.goto('/');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toMatch(/og-card\.jpg$/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    const res = await request.get(new URL(og).pathname);
    expect(res.status()).toBe(200);
  });

  test('es and it pages use correct relative asset paths', async ({ browser, baseURL }) => {
    for (const p of ['/es/', '/it/']) {
      const ctx = await browser.newContext({ baseURL });
      const page = await ctx.newPage();
      const bad = [];
      page.on('response', (r) => { if (r.status() >= 400) bad.push(r.url()); });
      page.on('requestfailed', (r) => { if (!/ERR_ABORTED/.test(r.failure()?.errorText || '')) bad.push(r.url()); });
      await page.goto(p, { waitUntil: 'networkidle' });
      expect(bad, p).toEqual([]);
      await ctx.close();
    }
  });
});

test.describe('motion layer', () => {
  test('kinetic name keeps an accessible name and a single h1', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveAttribute('aria-label', /Carlos Fernández San Millán/);
    expect(await page.locator('h1 .kn-ch').count()).toBeGreaterThan(15);
  });

  test('counters settle on the exact original values', async ({ page, viewport }) => {
    test.skip(viewport.width < 768, 'desktop layout');
    await page.goto('/');
    await expect(page.locator('#hero-budget')).toHaveText(/14M/, { timeout: 5000 });
    await expect(page.locator('#hero-team-size')).toHaveText(/25\+/, { timeout: 5000 });
  });

  test('reduced motion: no kinetic/animated effects, final values immediately', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', baseURL });
    const page = await ctx.newPage();
    await page.goto('/');
    const name = await page.locator('.kn-ch').first().evaluate((e) => getComputedStyle(e).animationName);
    expect(name).toBe('none');
    await expect(page.locator('#hero-budget')).toHaveText(/14M/);
    expect(await page.locator('[data-aos].reveal:not(.is-visible)').count()).toBe(0);
    await ctx.close();
  });

  test('works without JavaScript: all content visible', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForTimeout(1800); // let the CSS-only entrance animations finish
    const hidden = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().width > 0 && !e.classList.contains('hero-canvas')).length);
    expect(hidden).toBe(0);
    await ctx.close();
  });

  test('scroll progress bar and timeline fill respond to scrolling', async ({ page, viewport }) => {
    test.skip(viewport.width < 768, 'desktop layout');
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => page.locator('#scroll-progress').evaluate((e) => e.style.transform)).toContain('scaleX(1');
    await page.evaluate(() => document.getElementById('experience-timeline').scrollIntoView({ block: 'center' }));
    await expect.poll(() => page.locator('.timeline-line').evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue('--tl') || '0'))).toBeGreaterThan(0.05);
  });
});

test('photo tilt is limited to the area around the photo', async ({ page, viewport }) => {
  test.skip(viewport.width < 1024, 'desktop pointer only');
  await page.goto('/');
  await page.waitForTimeout(1500);
  const box = await page.locator('.photo-stage').boundingBox();
  const cy = box.y + box.height / 2;
  const angle = async () => page.locator('.photo-stage').evaluate((e) => {
    const m = new DOMMatrix(getComputedStyle(e).transform);
    return Math.abs(Math.asin(Math.max(-1, Math.min(1, m.m13))) * 180 / Math.PI);
  });
  await page.mouse.move(box.x - box.width * 2, cy); // far left, same height as the photo
  await page.waitForTimeout(400);
  expect(await angle()).toBeLessThan(0.5);
  await page.mouse.move(box.x + box.width * 0.9, cy); // over the photo's edge
  await page.waitForTimeout(400);
  const near = await angle();
  expect(near).toBeGreaterThan(1);
  expect(near).toBeLessThanOrEqual(7.1);
});
