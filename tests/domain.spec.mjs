import { test, expect } from 'playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// The site's domain is defined in ONE place (SITE_ORIGIN in assets/js/site-content.js).
// These tests make sure the committed build output follows it and that no other source file hardcodes it,
// so moving to another domain is a one-line change plus a rebuild.
const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const origin = read('assets/js/site-content.js').match(/const SITE_ORIGIN = '(https:\/\/[^']+)'/)[1];
const host = origin.replace(/^https:\/\//, '');

test.describe('single-source site domain', () => {
  test('the origin is a bare https origin (no path, no trailing slash)', () => {
    expect(origin).toMatch(/^https:\/\/[a-z0-9.-]+$/);
  });

  test('committed output follows the configured domain', () => {
    expect(read('CNAME')).toBe(host);
    expect(read('robots.txt')).toContain(`Sitemap: ${origin}/sitemap.xml`);
    const sitemap = read('sitemap.xml');
    expect(sitemap).toContain(`<loc>${origin}/</loc>`);
    expect(sitemap).toContain(`<loc>${origin}/es/</loc>`);
    expect(sitemap).toContain(`<loc>${origin}/it/</loc>`);
    for (const [page, suffix] of [['index.html', '/'], ['es/index.html', '/es/'], ['it/index.html', '/it/']]) {
      const html = read(page);
      expect(html, page).toContain(`<link rel="canonical" href="${origin}${suffix}">`);
      expect(html, page).toContain(`<meta property="og:url" content="${origin}${suffix}">`);
      // Every absolute URL on the site's own host must be on the configured host.
      const hosts = new Set([...html.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1].toLowerCase()));
      const own = [...hosts].filter((h) => h.endsWith(host.replace(/^www\./, '')));
      expect(own, page).toEqual([host]);
    }
  });

  test('no source file hardcodes the domain (it must come from SITE_ORIGIN)', () => {
    const bare = host.replace(/^www\./, '');
    const offenders = [];
    const scan = (dir, skip = []) => {
      for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = path.posix.join(dir, entry.name);
        if (skip.includes(rel)) continue;
        if (entry.isDirectory()) { scan(rel, skip); continue; }
        if (!/\.(js|mjs|cjs|css|yml|yaml|json|html)$/.test(entry.name)) continue;
        if (read(rel).includes(bare)) offenders.push(rel);
      }
    };
    // Generated/pre-rendered output is covered by the test above; page-template.html carries placeholders
    // that the build overwrites from the config, and docs/README are prose.
    scan('assets/js', ['assets/js/site-content.js']);
    scan('scripts', ['scripts/page-template.html']);
    scan('.github');
    expect(offenders).toEqual([]);
  });
});
