import { test, expect } from 'playwright/test';

// Layout regressions found by a visual pass of the live site: content must never be cut off by the viewport, at the widths
// people actually use (phones, tablets, small laptops), in every language.
const LANGS = ['/', '/es/', '/it/'];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
});

async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 400)))));
}

for (const lang of LANGS) {
  test(`${lang}: the navigation fits at every width, as a menu or as links`, async ({ page }) => {
    for (const width of [768, 820, 1024, 1180, 1279, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(lang);
      await settle(page);
      const right = await page.evaluate(() => Math.max(...[...document.querySelectorAll('#navbar a, #navbar button')]
        .filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && getComputedStyle(e).visibility !== 'hidden'; })
        .map((e) => e.getBoundingClientRect().right)));
      expect(right, `${lang} navigation reaches ${Math.round(right)}px at ${width}px`).toBeLessThanOrEqual(width + 1);
      // exactly one of the two navigations is usable
      const desktopNav = await page.locator('#nav-links-desktop').isVisible();
      const menuButton = await page.locator('#mobile-menu-btn').isVisible();
      expect(desktopNav !== menuButton, `${lang} at ${width}px: desktop links ${desktopNav}, menu button ${menuButton}`).toBe(true);
    }
  });

  test(`${lang}: the floating hero badges stay inside the screen and clear of the text`, async ({ page }) => {
    for (const width of [1024, 1280, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(lang);
      await settle(page);
      const m = await page.evaluate(() => {
        const rects = [...document.querySelectorAll('.hero-badge')].map((e) => e.getBoundingClientRect());
        const text = [...document.querySelectorAll('#home h1, #home p')].filter((e) => !e.closest('.hero-badge') && e.getBoundingClientRect().width > 0)
          .map((e) => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect().right; });
        return { right: Math.max(...rects.map((r) => r.right)), left: Math.min(...rects.map((r) => r.left)), textRight: Math.max(...text) };
      });
      expect(m.right, `${lang} badges reach ${Math.round(m.right)}px at ${width}px`).toBeLessThanOrEqual(width);
      expect(m.left, `${lang} badges start at ${Math.round(m.left)}px, text ends at ${Math.round(m.textRight)}px, at ${width}px`).toBeGreaterThan(m.textRight);
    }
  });

  test(`${lang}: on a phone the years badge and the profile highlights fit`, async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(lang);
      await settle(page);
      const m = await page.evaluate(() => {
        const badge = document.querySelector('#about-years-value').parentElement.getBoundingClientRect();
        const titles = [...document.querySelectorAll('#about-feature-list h3')].map((e) => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect().right; });
        const columns = getComputedStyle(document.getElementById('about-feature-list')).gridTemplateColumns.split(' ').length;
        return { badgeRight: badge.right, titleRight: Math.max(...titles), columns };
      });
      expect(m.badgeRight, `${lang} years badge reaches ${Math.round(m.badgeRight)}px at ${width}px`).toBeLessThanOrEqual(width);
      expect(m.titleRight, `${lang} highlight titles reach ${Math.round(m.titleRight)}px at ${width}px`).toBeLessThanOrEqual(width - 16);
      expect(m.columns).toBe(1); // one per row: two columns leave long words (Ciberseguridad) about 100px
    }
  });
}

test('the scroll cue is a comfortable touch target', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('#scroll-to-about-link').boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test('on a tablet the menu opens, shows every section and the language links, and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/es/');
  await page.locator('#mobile-menu-btn').click();
  const menu = page.locator('#mobile-menu');
  await expect(menu).toHaveClass(/open/);
  await expect(menu).toHaveAttribute('aria-hidden', 'false');
  expect(await menu.locator('a').count()).toBeGreaterThanOrEqual(8); // sections + languages
  await expect(menu.locator('a[href="/it/"]').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveClass(/open/);
  await expect(menu).toHaveAttribute('aria-hidden', 'true');
});
