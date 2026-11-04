import { test, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/es/', '/it/'];

for (const path of PAGES) {
  for (const consent of ['banner-open', 'banner-closed']) {
    test(`axe: no serious/critical violations on ${path} (${consent})`, async ({ page }) => {
      if (consent === 'banner-closed') {
        await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
      }
      await page.goto(path);
      // Let entrance animations settle so contrast is measured on final colours.
      await page.waitForTimeout(2200);
      await page.evaluate(() => document.querySelectorAll('[data-aos]').forEach((n) => n.classList.add('is-visible')));
      await page.waitForTimeout(1000);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      const blocking = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      const summary = blocking.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(summary).toEqual([]);
    });
  }
}

test('landmarks: header, nav, main, footer; hero subtitle is not a heading', async ({ page }) => {
  await page.goto('/');
  for (const tag of ['header', 'nav', 'main', 'footer']) {
    expect(await page.locator(tag).count(), tag).toBeGreaterThan(0);
  }
  await expect(page.locator('#hero-title')).not.toHaveJSProperty('tagName', 'H2');
  const levels = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]));
  for (let i = 1; i < levels.length; i += 1) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
});

test('keyboard: skip link works and focus is visible', async ({ page, viewport }) => {
  test.skip(viewport.width < 768, 'desktop keyboard flow');
  await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('#skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator('#main-content')).toBeFocused();
});
