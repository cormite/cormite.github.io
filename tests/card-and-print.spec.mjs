import { test, expect } from 'playwright/test';
import fs from 'node:fs';

// Contact card (.vcf) per language, and a clean printed page.
const LANGS = [['/', 'en'], ['/es/', 'es'], ['/it/', 'it']];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
});

for (const [url, lang] of LANGS) {
  test(`${url} offers a valid contact card in its own language`, async ({ page, request }) => {
    await page.goto(url);
    const link = page.locator('#contact-card-link');
    await expect(link).toHaveAttribute('href', `/carlos-fernandez-san-millan-${lang}.vcf`);
    // The link as a browser resolves it from THIS page must work (a relative path under /es/ would be a 404).
    const resolved = await link.evaluate((a) => a.href);
    expect((await request.get(resolved)).status(), resolved).toBe(200);
    await expect(link).toHaveAttribute('download', '');
    const res = await request.get(`/carlos-fernandez-san-millan-${lang}.vcf`);
    expect(res.status()).toBe(200);
    const text = await res.text();
    const lines = text.split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines[1]).toBe('VERSION:3.0');
    expect(lines.at(-2)).toBe('END:VCARD'); // trailing CRLF leaves an empty last element
    expect(text).toContain('FN:Carlos Fernández San Millán');
    expect(text).toMatch(/EMAIL;TYPE=INTERNET,WORK:hello@carlosfernandezsanmillan\.com/);
    expect(text).toContain(`URL:https://carlosfernandezsanmillan.com/${lang === 'en' ? '' : `${lang}/`}`);
    expect(/(^|[^\r])\n/.test(text)).toBe(false); // CRLF line endings only
  });
}

test('the command menu can save the contact card', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  await page.locator('.palette-input').fill('vcard');
  await expect(page.locator('.palette-option')).toHaveCount(1);
});

test('printing gives a clean document: no navigation or controls, no dark panels, readable text', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.emulateMedia({ media: 'print' });
  const state = await page.evaluate(() => {
    const visible = (sel) => [...document.querySelectorAll(sel)].some((e) => getComputedStyle(e).display !== 'none');
    const sections = [...document.querySelectorAll('main section')].map((s) => getComputedStyle(s).backgroundColor);
    return {
      nav: visible('header'), form: visible('#contact-form'), palette: visible('#palette-btn'),
      darkSections: sections.filter((c) => c !== 'rgba(0, 0, 0, 0)').length,
      textColour: getComputedStyle(document.querySelector('#about p')).color,
      heroMinHeight: getComputedStyle(document.querySelector('#home')).minHeight
    };
  });
  expect(state.nav).toBe(false);
  expect(state.form).toBe(false);
  expect(state.palette).toBe(false);
  expect(state.darkSections).toBe(0);
  expect(state.textColour).toBe('rgb(17, 17, 17)');
  expect(state.heroMinHeight).toBe('0px'); // the hero is no longer a full-screen panel
});
