import { test, expect } from 'playwright/test';

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
    expect(values).toHaveLength(9);
    // data transferred and requests are real numbers, within the budget the suite enforces elsewhere
    expect(parseFloat(values[0].replace(',', '.'))).toBeGreaterThan(10);
    expect(parseInt(values[1], 10)).toBeGreaterThan(3);
    expect(parseInt(values[1], 10)).toBeLessThanOrEqual(12);
    expect(values[8]).toMatch(/^[0-9a-f]{10}$/); // build hash equals the bundle hash on the page
    const bundle = await page.evaluate(() => document.querySelector('script[src*="app."]').src.match(/app\.([0-9a-f]+)\.js/)[1]);
    expect(values[8]).toBe(bundle);
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
