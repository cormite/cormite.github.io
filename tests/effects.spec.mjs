import { test, expect } from 'playwright/test';

// The hero constellation animation must stop when the hero is scrolled out of view and must not come back to life just
// because the tab became visible again while the hero is still off screen (it used to, burning battery for nothing).
test('the hero animation does not restart on tab focus while the hero is off screen', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cormite-consent-v1', 'denied');
    window.__raf = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => { window.__raf += 1; return original(callback); };
  });
  await page.goto('/');
  await page.waitForSelector('.hero-canvas');
  test.skip(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches), 'animation is off for reduced motion');

  await page.evaluate(() => document.getElementById('contact').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(2600); // observer fires, the loop stops, and the 1.4 s count-up of the hero numbers has finished

  await page.evaluate(() => {
    window.__raf = 0;
    // A tab coming back to the foreground.
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(500);
  const frames = await page.evaluate(() => window.__raf);
  // A running loop would request about 30 frames in half a second; a quiet page requests at most a handful.
  expect(frames, 'animation frames requested while the hero is off screen').toBeLessThan(6);
});

test('the hero animation runs while the hero is on screen', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cormite-consent-v1', 'denied');
    window.__raf = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => { window.__raf += 1; return original(callback); };
  });
  await page.goto('/');
  await page.waitForSelector('.hero-canvas');
  test.skip(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches), 'animation is off for reduced motion');
  await page.waitForTimeout(500);
  await page.evaluate(() => { window.__raf = 0; });
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__raf)).toBeGreaterThan(10);
});
