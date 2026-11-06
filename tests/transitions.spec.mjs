import { test, expect } from 'playwright/test';

// Cross-document View Transitions: switching language cross-fades instead of flashing white.
// These tests are deterministic (CSS rules and element names). Whether a given browser actually runs the transition is
// checked once, from the top of the page, in transition-runs.spec.mjs.

test.describe('page transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
  });

  const rules = (page) => page.evaluate(() => {
    const flat = (list, inMedia) => [...list].flatMap((rule) => (rule.type === CSSRule.MEDIA_RULE ? flat(rule.cssRules, rule.conditionText) : [{ text: rule.cssText, media: inMedia || '' }]));
    return [...document.styleSheets].flatMap((sheet) => flat(sheet.cssRules, ''));
  });

  test('the opt-in is a top-level rule for everyone; reduced motion switches the animations off instead', async ({ page }) => {
    await page.goto('/es/');
    const all = await rules(page);
    const optIn = all.filter((r) => /^@view-transition/.test(r.text) && /navigation:\s*auto/.test(r.text));
    expect(optIn, 'exactly one opt-in rule').toHaveLength(1);
    // Nested inside a prefers-reduced-motion media query, Chromium sometimes evaluated the opt-in too late on the new page and
    // cancelled the transition ("ViewTransition opt-in disabled"), so it must not be inside any media query.
    expect(optIn[0].media).toBe('');
    const reduced = all.filter((r) => r.media.includes('prefers-reduced-motion: reduce') && /view-transition/.test(r.text));
    expect(reduced.length).toBeGreaterThan(0);
    // Browsers serialise `animation: none` in its expanded form ("... normal none running none"): the animation name must be none.
    for (const rule of reduced) expect(rule.text).toMatch(/animation(-name)?:[^;]*\bnone\b[^;]*!important/);
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
