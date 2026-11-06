import { test, expect } from 'playwright/test';

// Cross-document View Transitions: switching language cross-fades instead of flashing white.
// `pagereveal` reports whether the browser ran a transition for the page that just loaded.
const record = () => {
  window.addEventListener('pagereveal', (event) => sessionStorage.setItem('vt', event.viewTransition ? 'yes' : 'no'));
};

// A browser only transitions from a page it has already painted: let two frames pass, as a real visitor's click would.
const settle = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 300)))));

test.describe('page transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
    await page.addInitScript(record);
  });

  // Deterministic gate: the opt-in rule is present for normal visitors and absent under reduced motion.
  const optInRules = (page) => page.evaluate(() => [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules])
    .flatMap((rule) => (rule.type === CSSRule.MEDIA_RULE ? [...rule.cssRules] : [rule]))
    .filter((rule) => /^@view-transition/.test(rule.cssText) && /navigation:\s*auto/.test(rule.cssText)).length);

  test('visitors who accept motion opt in to cross-document transitions; reduced motion does not', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/es/');
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: no-preference)').matches)).toBe(true);
    expect(await optInRules(page)).toBe(1);
    // The rule sits inside a no-preference media query, so under reduced motion the browser never applies it.
    const rule = await page.evaluate(() => [...document.styleSheets].flatMap((s) => [...s.cssRules]).find((r) => r.type === CSSRule.MEDIA_RULE && /view-transition/.test(r.cssText)).conditionText);
    expect(rule).toContain('prefers-reduced-motion: no-preference');
  });

  // Behavioural check in a real browser. Chromium skips transitions when the machine is saturated (many parallel
  // workers), so this one is retried; the deterministic tests above are the gate.
  test.describe.configure({ retries: 3 });
  test('switching language runs a view transition', async ({ page }) => {
    await page.goto('/');
    test.skip(!(await page.evaluate(() => 'ViewTransition' in window)), 'this browser has no View Transitions');
    await settle(page);
    await page.evaluate(() => sessionStorage.removeItem('vt'));
    await page.locator('#nav-links-desktop .lang-btn[data-lang="es"], #nav-links-mobile .lang-btn[data-lang="es"]').first().evaluate((a) => a.click());
    await expect(page).toHaveURL(/\/es\/$/);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('vt'))).toBe('yes');
  });

  test('reduced motion: no transition, the navigation still works', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => sessionStorage.removeItem('vt'));
    await page.locator('#nav-links-desktop .lang-btn[data-lang="it"], #nav-links-mobile .lang-btn[data-lang="it"]').first().evaluate((a) => a.click());
    await expect(page).toHaveURL(/\/it\/$/);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('vt'))).toBe('no');
  });

  test('the persistent elements have unique transition names on every page', async ({ page }) => {
    for (const path of ['/', '/es/', '/it/']) {
      await page.goto(path);
      const names = await page.evaluate(() => [...document.querySelectorAll('*')]
        .map((el) => getComputedStyle(el).viewTransitionName).filter((n) => n && n !== 'none' && n !== 'root')); // 'root' is the browser's own name for <html>
      // A duplicate name would make the browser skip the whole transition.
      expect(new Set(names).size, `${path}: ${names.join(',')}`).toBe(names.length);
      expect(names.sort()).toEqual(['hero-portrait', 'site-nav']);
    }
  });

  test('the mobile menu and the command menu are unaffected', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.click('#mobile-menu-btn');
    await expect(page.locator('#mobile-menu')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+k');
    await expect(page.locator('dialog.palette')).toBeVisible();
  });
});
