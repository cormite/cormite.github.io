import { test, expect } from 'playwright/test';

const PAGES = [
  { path: '/', lang: 'en', placeholder: 'Type a command or search', contact: 'Contact' },
  { path: '/es/', lang: 'es', placeholder: 'Escribe un comando o busca', contact: 'Contacto' },
  { path: '/it/', lang: 'it', placeholder: 'Scrivi un comando o cerca', contact: 'Contatti' }
];

// Consent denied so no analytics script is requested; the palette must work regardless.
async function open(page, path) {
  await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
  await page.goto(path);
  await page.waitForFunction(() => Boolean(window.__SITE_PALETTE));
}

for (const { path, lang, placeholder, contact } of PAGES) {
  test.describe(`command menu ${path}`, () => {
    test('opens with the shortcut, filters, runs and restores focus', async ({ page }) => {
      await open(page, path);
      await page.keyboard.press('Control+k');
      const dialog = page.locator('dialog.palette');
      await expect(dialog).toBeVisible();
      await expect(page.locator('.palette-input')).toBeFocused();
      await expect(page.locator('.palette-input')).toHaveAttribute('placeholder', placeholder);

      await page.keyboard.type('contact'.slice(0, 3));
      await expect(page.locator('.palette-option').first()).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(dialog).toBeHidden();
      await expect.poll(() => page.evaluate(() => location.hash)).toBe('#contact');
    });

    test('Escape closes and returns focus to where it was', async ({ page }) => {
      await open(page, path);
      await page.locator('#hero-contact-button').focus();
      await page.keyboard.press('Control+k');
      await expect(page.locator('dialog.palette')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('dialog.palette')).toBeHidden();
      await expect(page.locator('#hero-contact-button')).toBeFocused();
    });

    test('arrow keys move the selection and aria-activedescendant follows', async ({ page }) => {
      await open(page, path);
      await page.keyboard.press('Control+k');
      const input = page.locator('.palette-input');
      const first = await input.getAttribute('aria-activedescendant');
      await page.keyboard.press('ArrowDown');
      const second = await input.getAttribute('aria-activedescendant');
      expect(second).not.toBe(first);
      await expect(page.locator(`#${second}`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator(`#${first}`)).toHaveAttribute('aria-selected', 'false');
    });

    test('shows an empty state for an unknown command', async ({ page }) => {
      await open(page, path);
      await page.keyboard.press('Control+k');
      await page.keyboard.type('zzzzqqq');
      await expect(page.locator('.palette-empty')).toBeVisible();
      await expect(page.locator('.palette-option')).toHaveCount(0);
    });
  });
}

test('"/" opens the menu outside inputs and is ignored inside the contact form', async ({ page }) => {
  await open(page, '/');
  await page.locator('#contact-name').focus();
  await page.keyboard.type('/');
  await expect(page.locator('dialog.palette')).toHaveCount(0);
  await expect(page.locator('#contact-name')).toHaveValue('/');
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press('/');
  await expect(page.locator('dialog.palette')).toBeVisible();
});

test('the navigation button opens the menu (mouse and touch users)', async ({ page }) => {
  await open(page, '/');
  const button = page.locator('#palette-btn');
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute('aria-label', /^Open command menu \((Ctrl K|.K)\)$/);
  await button.click();
  await expect(page.locator('dialog.palette')).toBeVisible();
});

test('language action navigates to the other language page', async ({ page }) => {
  await open(page, '/');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('espa');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/es\/$/);
});

test('focus is trapped inside the open menu', async ({ page }) => {
  await open(page, '/');
  await page.keyboard.press('Control+k');
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => document.querySelector('dialog.palette').contains(document.activeElement) || document.activeElement === document.body);
  expect(inside).toBe(true);
});

test('opening the menu raises no CSP violation and no console error', async ({ page }) => {
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(String(e)));
  await open(page, '/');
  await page.keyboard.press('Control+k');
  await page.keyboard.press('Escape');
  expect(problems).toEqual([]);
});

test.describe('"now" line', () => {
  test('shows Milan time, updates each minute, reserves its width', async ({ page }) => {
    // 2026-11-05T11:07:30Z is 12:07 in Milan (CET, UTC+1).
    await page.clock.install({ time: new Date('2026-11-05T11:07:30Z') });
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
    await page.goto('/');
    const time = page.locator('#hero-time');
    await expect(time).toHaveText('· 12:07');
    await expect(time).toHaveAttribute('aria-hidden', 'true');
    await page.clock.runFor(60_000);
    await expect(time).toHaveText('· 12:08');
  });

  test('uses Milan summer time (CEST) in July', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-07-15T10:00:00Z') });
    await page.goto('/');
    await expect(page.locator('#hero-time')).toHaveText('· 12:00');
  });

  test('the accessible location text stays plain', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero-location')).toHaveText('Milan, Italy');
  });
});
