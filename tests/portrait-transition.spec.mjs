import { test, expect } from 'playwright/test';
import { pixelAt } from './helpers/png.mjs';

// Regression: the transition snapshot used to be taken of the <picture> inside the round frame, so for an instant the
// portrait showed as a grey square. The element that carries the transition name must itself be the circle.
// Runs once (its viewport is explicit), and waits until the browser reports a transition in flight before the screenshot,
// so a busy machine cannot make it look at the wrong moment.
test.use({ bypassCSP: true, viewport: { width: 1440, height: 900 } });

test('no square corners while switching language', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cormite-consent-v1', 'denied');
    const style = document.createElement('style');
    // Slow the transition down so a screenshot can land inside it; hide the floating badges that overlap the corners.
    style.textContent = '::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation-duration: 8s !important; } .hero-badge { display: none !important; }';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
  });
  await page.goto('/');
  test.skip(!(await page.evaluate(() => 'ViewTransition' in window)), 'this browser has no View Transitions');
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 1800)))));
  const box = await page.locator('.photo-ring').boundingBox();
  await page.locator('#nav-links-desktop .lang-btn[data-lang="es"]').evaluate((a) => a.click());
  await page.waitForURL(/\/es\/$/);
  // The state we want to look at: a view transition is running right now.
  // Chromium skips a transition on a saturated machine; then nothing is animating and no square can appear.
  const running = await expect.poll(() => page.evaluate(() => document.documentElement.matches(':active-view-transition')), { timeout: 10_000 }).toBe(true).then(() => true, () => false);
  test.skip(!running, 'the browser skipped the transition (busy machine)');
  await page.waitForTimeout(400);

  // A point just inside each corner of the portrait's bounding square lies outside the circle. Each sampled frame is
  // classified: "clean" (all four corners show the blue hero), "blank" (all four show the plain page background: the
  // browser had not painted the transition yet, which a loaded CI machine does for whole seconds) or "square" (anything
  // else: the photo's grey backdrop is showing in the corners). The square bug persists through the whole transition, so
  // it must never be the only thing seen; a run that never got a painted frame proves nothing and is skipped.
  const PAGE_BACKGROUND = [248, 250, 252];
  const verdicts = [];
  for (let frame = 0; frame < 6; frame += 1) {
    const shot = await page.screenshot({ type: 'png' });
    const corners = [[6, 6], [box.width - 7, 6], [6, box.height - 7], [box.width - 7, box.height - 7]]
      .map(([dx, dy]) => pixelAt(shot, Math.round(box.x + dx), Math.round(box.y + dy)));
    const clean = corners.every(({ r, b }) => b - r > 40);
    const blank = corners.every(({ r, g, b }) => r === PAGE_BACKGROUND[0] && g === PAGE_BACKGROUND[1] && b === PAGE_BACKGROUND[2]);
    verdicts.push({ kind: clean ? 'clean' : blank ? 'blank' : 'square', corners: corners.map(({ r, g, b }) => `rgb(${r},${g},${b})`).join(' ') });
    if (clean) break;
    await page.waitForTimeout(250);
  }
  const summary = verdicts.map((v, i) => `frame ${i}: ${v.kind} ${v.corners}`).join('\n');
  test.skip(verdicts.every((v) => v.kind === 'blank'), `the browser never painted a frame of the transition (busy machine)\n${summary}`);
  expect(verdicts.some((v) => v.kind === 'clean'), `no frame showed the round portrait; the photo showed as a square:\n${summary}`).toBe(true);
});

// Deterministic guard for the same bug: the element that carries the transition name must itself be the circle, and
// nothing inside it may carry a name (a named <picture> is snapshotted as a square).
test('the named portrait element is the circle, and nothing inside it is named', async ({ page }) => {
  await page.goto('/');
  const info = await page.locator('#home .photo-ring').evaluate((el) => {
    const cs = getComputedStyle(el);
    const named = [...el.querySelectorAll('*')].filter((n) => getComputedStyle(n).viewTransitionName !== 'none').length;
    return { name: cs.viewTransitionName, radius: cs.borderTopLeftRadius, overflow: cs.overflow, named };
  });
  expect(info.name).toBe('hero-portrait');
  expect(info.overflow).toBe('hidden');
  expect(parseFloat(info.radius)).toBeGreaterThan(100);
  expect(info.named).toBe(0);
});
