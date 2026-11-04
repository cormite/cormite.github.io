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
