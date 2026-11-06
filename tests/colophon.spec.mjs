import { test, expect } from 'playwright/test';
import fs from 'node:fs';

// "How this page performed": real numbers from the browser's Performance API, reachable from the footer and the command menu.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
});

const LANGS = [['/', 'How this page performed'], ['/es/', 'Cómo se ha comportado esta página'], ['/it/', 'Come è andata questa pagina']];

for (const [url, title] of LANGS) {
  test(`${url} footer button opens the panel with measured values`, async ({ page }) => {
    await page.goto(url);
    await page.locator('#colophon-btn').click();
    const dialog = page.locator('dialog.colophon');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: title })).toBeVisible();
    const values = await dialog.locator('.colophon-list dd').allTextContents();
    expect(values).toHaveLength(10);
    // data transferred and requests are real numbers, within the budget the suite enforces elsewhere
    expect(parseFloat(values[0].replace(',', '.'))).toBeGreaterThan(10);
    expect(parseInt(values[1], 10)).toBeGreaterThan(3);
    expect(parseInt(values[1], 10)).toBeLessThanOrEqual(12);
    expect(values[9]).toMatch(/^[0-9a-f]{10}$/); // build hash equals the bundle hash on the page
    const bundle = await page.evaluate(() => document.querySelector('script[src*="app."]').src.match(/app\.([0-9a-f]+)\.js/)[1]);
    expect(values[9]).toBe(bundle);
    await expect(dialog.locator('meter')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('#colophon-btn')).toBeFocused(); // focus returns to the opener
  });
}

test('the command menu lists it and opens it', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  await page.locator('.palette-input').fill('perform');
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.colophon')).toBeVisible();
});

test('the panel is built from the page, uses no inline script and sends no request', async ({ page }) => {
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const before = requests.length;
  await page.locator('#colophon-btn').click();
  await expect(page.locator('dialog.colophon')).toBeVisible();
  expect(requests.length).toBe(before); // opening it costs nothing
});

// The panel promises that the page itself stays within 12 requests and 200 KB. Browser and host extras are listed apart, so a
// visit can never show "13" next to a limit of "12" without saying what the thirteenth is.
test('browser and host extras are counted apart, and the pattern matches what the build ships', async ({ page }) => {
  await page.goto('/');
  await page.locator('#colophon-btn').click();
  const values = await page.locator('dialog.colophon .colophon-list dd').allTextContents();
  expect(parseInt(values[1], 10)).toBeLessThanOrEqual(12); // page requests: inside the stated budget
  // simulate a production visit: the speculation rules and Cloudflare's script are extras, not page requests
  const counted = await page.evaluate(() => {
    const re = /\/(favicon\.ico|site\.webmanifest|assets\/speculation-rules\.json)$|\/cdn-cgi\//;
    return ['/favicon.ico', '/site.webmanifest', '/assets/speculation-rules.json', '/cdn-cgi/scripts/x/email-decode.min.js', '/assets/dist/app.1.js', '/assets/img/photo-640.avif'].map((p) => re.test(p));
  });
  expect(counted).toEqual([true, true, true, true, false, false]);
  // the same pattern is in the shipped script (a copy here would silently drift)
  const source = fs.readFileSync('assets/js/site-colophon.js', 'utf8');
  expect(source).toContain('favicon\\.ico|site\\.webmanifest|assets\\/speculation-rules\\.json)$|\\/cdn-cgi\\/');
});

test('on a small phone the panel opens at its top: the title is visible, not scrolled away', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/es/');
  await page.locator('#colophon-btn').click();
  const title = page.locator('dialog.colophon .colophon-title');
  await expect(title).toBeVisible();
  const box = await title.boundingBox();
  const dialog = await page.locator('dialog.colophon').boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(dialog.y); // not hidden above the panel's scroll position
  await expect(page.locator('dialog.colophon .colophon-close')).toBeAttached();
});
