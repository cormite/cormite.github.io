import { test, expect } from 'playwright/test';
import { pixelAt } from './helpers/png.mjs';

// Regression: on desktop the "Let Me Introduce Myself" photo sits in a fixed-height box and the image is scaled to
// cover it. Centred, that crops about 12% off the top and cut the head at the forehead. It is anchored to the top.
// The photo's backdrop is a plain grey, so if the head touches the top edge the centre of the first rows is skin or hair,
// not the same grey as the corner next to it.
const SIZES = [['desktop', 1440, 900], ['laptop', 1100, 800], ['tablet', 820, 1100], ['mobile', 390, 844]];

for (const lang of [['/', 'en'], ['/es/', 'es'], ['/it/', 'it']]) {
  for (const [name, width, height] of SIZES) {
    test(`${lang[1]} ${name}: the About portrait shows the whole head`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
      await page.goto(lang[0]);
      const image = page.locator('#about picture img');
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect.poll(() => page.evaluate(() => document.querySelector('#about [data-aos]').classList.contains('is-visible'))).toBe(true);
      await page.waitForTimeout(1300); // the reveal animation

      const box = await image.boundingBox();
      const shot = await page.screenshot({ type: 'png' });
      const at = (fx, dy) => pixelAt(shot, Math.round(box.x + box.width * fx), Math.round(box.y + dy));
      for (const dy of [4, 10]) {
        const centre = at(0.5, dy);
        const corner = at(0.2, dy);
        const gap = Math.max(Math.abs(centre.r - corner.r), Math.abs(centre.g - corner.g), Math.abs(centre.b - corner.b));
        expect(gap, `${name}: top edge at y=${dy} is not plain backdrop (centre rgb ${centre.r},${centre.g},${centre.b} vs side ${corner.r},${corner.g},${corner.b}): the head is cut`).toBeLessThan(24);
      }
    });
  }
}
