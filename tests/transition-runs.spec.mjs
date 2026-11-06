import { test, expect } from 'playwright/test';

// In-browser check that switching language really runs a view transition, and that reduced motion switches its animations off.
// Whether Chromium runs a cross-document transition is up to the browser: it can skip one on a saturated machine or when the
// page is scrolled far down (it then reports "opt-in disabled" even though both pages opt in), and the visitor simply gets a
// normal page load. So this runs once, desktop viewport, from the top of the page, with retries; the deterministic rule tests
// in transitions.spec.mjs are what gate the build.
test.use({ viewport: { width: 1440, height: 900 } });
test.describe.configure({ retries: 3 });

const record = () => {
  window.addEventListener('pagereveal', (event) => {
    if (!event.viewTransition) { sessionStorage.setItem('vt', 'no'); return; }
    sessionStorage.setItem('vt', 'yes');
    event.viewTransition.ready.then(
      () => sessionStorage.setItem('animations', String(document.getAnimations().filter((a) => String(a.effect && a.effect.pseudoElement).startsWith('::view-transition')).length)),
      () => sessionStorage.setItem('animations', 'rejected')
    );
  });
};
// A browser only transitions from a page it has already painted: let two frames pass, as a real visitor's click would.
const settle = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 300)))));

async function switchTo(page, lang) {
  await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
  await page.addInitScript(record);
  await page.goto('/');
  test.skip(!(await page.evaluate(() => 'ViewTransition' in window)), 'this browser has no View Transitions');
  await settle(page);
  await page.evaluate(() => sessionStorage.clear());
  await page.locator(`#nav-links-desktop .lang-btn[data-lang="${lang}"]`).evaluate((a) => a.click());
  await expect(page).toHaveURL(new RegExp(`/${lang}/$`));
}

test('switching language runs a view transition with animations', async ({ page }) => {
  await switchTo(page, 'es');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('vt'))).toBe('yes');
  await expect.poll(() => page.evaluate(() => Number(sessionStorage.getItem('animations')))).toBeGreaterThan(0);
});

test('reduced motion: the language switch works and no transition animation runs', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await switchTo(page, 'it');
  await page.waitForTimeout(1500);
  // Either the browser skipped the transition or it ran with its animations switched off: never a running animation.
  const animations = await page.evaluate(() => Number(sessionStorage.getItem('animations') || 0));
  expect(animations).toBe(0);
});
