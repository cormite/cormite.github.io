import { test, expect } from 'playwright/test';

// Regression: once the page was scrolled, the navigation bar gets a blur ("glass"). A blur makes position:fixed
// descendants size to the bar, so the drawer collapsed to an 80px strip and its links floated over the white page.
for (const path of ['/', '/es/', '/it/']) {
  test(`mobile menu is a full-height dark drawer after scrolling on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
    await page.goto(path);
    await page.evaluate(() => document.getElementById('about').scrollIntoView());
    await expect.poll(() => page.evaluate(() => document.getElementById('navbar').classList.contains('glass'))).toBe(true);

    await page.click('#mobile-menu-btn');
    const menu = page.locator('#mobile-menu');
    await expect(menu).toHaveClass(/open/);

    const facts = await page.evaluate(() => {
      const el = document.getElementById('mobile-menu');
      const box = el.getBoundingClientRect();
      return {
        height: Math.round(box.height), viewport: window.innerHeight, width: Math.round(box.width),
        background: getComputedStyle(el).backgroundColor,
        insideNav: Boolean(el.closest('nav')),
        linkColor: getComputedStyle(el.querySelector('#nav-links-mobile a')).color
      };
    });
    expect(facts.insideNav, 'the drawer must not live inside the blurred nav').toBe(false);
    expect(facts.height).toBe(facts.viewport);
    expect(facts.background).toBe('rgb(11, 27, 61)');
    expect(facts.linkColor).toBe('rgb(255, 255, 255)');

    // Every link sits on the dark drawer, not on the page behind it.
    const links = page.locator('#nav-links-mobile a');
    for (let i = 0; i < await links.count(); i += 1) {
      const box = await links.nth(i).boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(facts.height);
      expect(box.x).toBeGreaterThanOrEqual(390 - facts.width);
    }
  });
}
