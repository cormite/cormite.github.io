import { test, expect } from 'playwright/test';
import fs from 'node:fs';

// The "Trust and security" pages: static, no script, localised, linked from the footer, listed for crawlers.
const PAGES = [['/trust/', 'en', 'Trust and security'], ['/es/trust/', 'es', 'Confianza y seguridad'], ['/it/trust/', 'it', 'Fiducia e sicurezza']];

for (const [url, lang, title] of PAGES) {
  test(`${url} is a complete, script-free page in ${lang}`, async ({ page, request }) => {
    const html = await (await request.get(url)).text();
    expect(html).not.toMatch(/<script/i); // nothing runs, nothing loads: the privacy page does not track
    expect(html).toMatch(/<meta http-equiv="Content-Security-Policy"/);
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    expect(await page.locator('h2').count()).toBeGreaterThanOrEqual(7);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://carlosfernandezsanmillan.com${url}`);
    expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBe(4);
    await expect(page.locator('a[href="mailto:security@carlosfernandezsanmillan.com"]').first()).toBeVisible();
    await expect(page.locator('a[href="/.well-known/security.txt"]')).toBeVisible();
    await expect(page.locator('a[href="https://github.com/cormite/cormite.github.io"]')).toBeVisible();
    // language switcher points to the same page in the other languages and marks the current one
    await expect(page.locator('.doc-langs a[aria-current="page"]')).toHaveText(lang.toUpperCase());
    expect(await page.locator('.doc-langs a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))).toEqual(['/trust/', '/es/trust/', '/it/trust/']);
  });
}

test('every home page links to its own trust page, and the sitemap and llms.txt list them', async ({ request }) => {
  for (const [home, , ] of [['/'], ['/es/'], ['/it/']]) {
    const html = await (await request.get(home)).text();
    const expected = home === '/' ? '/trust/' : `${home}trust/`;
    expect(html).toContain(`id="trust-link" class="privacy-settings-btn" href="${expected}"`);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const [url] of PAGES) expect(sitemap).toContain(`<loc>https://carlosfernandezsanmillan.com${url}</loc>`);
  expect(await (await request.get('/llms.txt')).text()).toContain('/trust/');
});

test('every claim that names a file points to a file that exists', async ({ request }) => {
  expect((await request.get('/.well-known/security.txt')).status()).toBe(200);
  const source = fs.readFileSync('scripts/trust-content.mjs', 'utf8');
  // The trust text says production needs a typed confirmation and a reviewer: the workflow must still say so.
  const deploy = fs.readFileSync('.github/workflows/deploy-production.yml', 'utf8');
  expect(deploy).toContain('Type DEPLOY');
  expect(deploy).toMatch(/environment:\s*\n\s*name: production/);
  // ...and that a 200 KB / 12 request budget is enforced.
  const perf = fs.readFileSync('tests/performance.spec.mjs', 'utf8');
  expect(perf).toMatch(/12/);
  expect(source).toContain('200 KB');
});
