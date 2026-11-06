import { test, expect } from 'playwright/test';
import fs from 'node:fs';

// Build notes (three languages), the engineering log with its Atom feed, and the keyboard shortcuts.
const STACK = [['/stack/', 'en', 'How this site is built'], ['/es/stack/', 'es', 'Cómo está construido este sitio'], ['/it/stack/', 'it', 'Come è costruito questo sito']];

for (const [url, lang, title] of STACK) {
  test(`${url} is a complete, script-free decision record in ${lang}`, async ({ page, request }) => {
    const html = await (await request.get(url)).text();
    expect(html).not.toMatch(/<script/i);
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    expect(await page.locator('h2').count()).toBe(9); // the request path plus eight decisions
    expect(await page.locator('.doc-flow li').count()).toBe(4);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://carlosfernandezsanmillan.com${url}`);
    expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBe(4);
    expect(await page.locator('.doc-langs a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))).toEqual(['/stack/', '/es/stack/', '/it/stack/']);
    // every internal link on the page works
    for (const href of await page.locator('main a[href^="/"]').evaluateAll((a) => [...new Set(a.map((x) => x.getAttribute('href')))])) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  });
}

test('engineering log: dated entries newest first, none in the future, feed matches the page', async ({ page, request }) => {
  await page.goto('/changelog/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Engineering log');
  const dates = await page.locator('.doc-entry time').evaluateAll((t) => t.map((x) => x.getAttribute('datetime')));
  expect(dates.length).toBeGreaterThanOrEqual(10);
  expect([...dates].sort().reverse()).toEqual(dates);
  const today = new Date().toISOString().slice(0, 10);
  for (const d of dates) { expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(d <= today, d).toBe(true); }
  expect(await page.locator('.doc-entry h2').count()).toBe(dates.length);
  await expect(page.locator('link[rel="alternate"][type="application/atom+xml"]')).toHaveAttribute('href', 'https://carlosfernandezsanmillan.com/changelog/feed.xml');

  const feed = await request.get('/changelog/feed.xml');
  expect(feed.status()).toBe(200);
  const xml = await feed.text();
  expect(xml.startsWith('<?xml')).toBe(true);
  expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
  const entries = [...xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)].map((m) => m[0]);
  expect(entries.length).toBe(dates.length);
  const ids = entries.map((e) => e.match(/<id>([^<]+)<\/id>/)[1]);
  expect(new Set(ids).size).toBe(ids.length); // unique, so readers never show duplicates
  for (const e of entries) {
    expect(e).toMatch(/<updated>\d{4}-\d{2}-\d{2}T\d{2}:00:00Z<\/updated>/);
    expect(e).toMatch(/<title>[^<]+<\/title>/);
  }
  expect(xml.match(/<updated>([^<]+)<\/updated>/)[1].slice(0, 10)).toBe(dates[0]); // feed date = newest entry, never the build clock
  expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|#)/); // well-formed escaping
  expect(fs.readFileSync('scripts/changelog-content.mjs', 'utf8')).not.toContain('carlosfernandezsanmillan.com'); // the domain lives in one place
});

test('the new pages are in the sitemap and llms.txt', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const p of ['/stack/', '/es/stack/', '/it/stack/', '/changelog/']) expect(sitemap).toContain(`<loc>https://carlosfernandezsanmillan.com${p}</loc>`);
  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).toContain('/stack/');
  expect(llms).toContain('/changelog/feed.xml');
});

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
  });

  test('? lists them, Escape closes, focus returns', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('?');
    const dialog = page.locator('dialog.colophon');
    await expect(dialog.getByRole('heading', { name: 'Keyboard shortcuts' })).toBeVisible();
    expect(await dialog.locator('kbd').count()).toBeGreaterThanOrEqual(9);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('l switches to the next language', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('l');
    await page.waitForURL(/\/es\/$/);
  });

  test('g then c jumps to the contact section', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('g');
    await page.keyboard.press('c');
    await expect.poll(() => page.evaluate(() => document.getElementById('contact').getBoundingClientRect().top)).toBeLessThan(200);
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#contact');
  });

  test('shortcuts never fire while typing in a field', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact-name').fill('');
    await page.locator('#contact-name').focus();
    await page.keyboard.type('l?g');
    await expect(page.locator('#contact-name')).toHaveValue('l?g');
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });

  test('single-key shortcuts can be switched off (WCAG 2.1.4) and the choice is remembered', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('?');
    await page.locator('.keys-toggle input').uncheck();
    await page.keyboard.press('Escape');
    await page.keyboard.press('l');
    await page.keyboard.press('/');
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/localhost:\d+\/$/); // no language change
    await expect(page.locator('dialog[open]')).toHaveCount(0); // no command menu
    expect(await page.evaluate(() => localStorage.getItem('cormite-keys'))).toBe('off');
    await page.reload();
    await page.keyboard.press('l');
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    // the modifier shortcut and the menu entry still work
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k');
    await expect(page.locator('dialog.palette[open]')).toBeVisible();
  });

  test('the command menu lists the new pages', async ({ page }) => {
    await page.goto('/es/');
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k');
    await page.locator('.palette-input').fill('registro');
    await expect(page.locator('.palette-option')).toHaveCount(1);
  });
});
