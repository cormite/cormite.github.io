import { test, expect } from 'playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// These tests assemble each deployment layout into a unique temp folder (desktop and mobile projects run in parallel)
// and check the generated Cloudflare `_headers` file. They never touch the network.
const assemble = (...flags) => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'headers-'));
  execFileSync('node', ['scripts/assemble-site.mjs', ...flags, '--out', out], { stdio: 'pipe' });
  return out;
};
const parse = (text) => {
  const rules = {};
  let current = null;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    if (!line.startsWith(' ')) { current = line.trim(); rules[current] = {}; continue; }
    const i = line.indexOf(':');
    rules[current][line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return rules;
};

test.describe('security headers (Cloudflare _headers)', () => {
  test('production layout ships the full hardening set', () => {
    const out = assemble('--cloudflare');
    try {
      const rules = parse(fs.readFileSync(path.join(out, '_headers'), 'utf8'));
      const all = rules['/*'];
      expect(all['Strict-Transport-Security']).toMatch(/max-age=31536000; includeSubDomains/);
      expect(all['X-Content-Type-Options']).toBe('nosniff');
      expect(all['X-Frame-Options']).toBe('DENY');
      expect(all['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(all['Permissions-Policy']).toContain('camera=()');
      expect(all['Cross-Origin-Opener-Policy']).toBe('same-origin');
      expect(all['Content-Security-Policy']).toContain("frame-ancestors 'none'");
      expect(all['Content-Security-Policy']).toContain('upgrade-insecure-requests');
      expect(all['Content-Security-Policy']).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
      expect(all['X-Robots-Tag']).toBeUndefined(); // production must stay indexable
      expect(rules['/assets/dist/*']['Cache-Control']).toBe('public, max-age=31536000, immutable');
      expect(fs.existsSync(path.join(out, 'CNAME'))).toBe(false); // Cloudflare manages the domain
      expect(fs.readFileSync(path.join(out, 'robots.txt'), 'utf8')).not.toMatch(/Disallow: \/\s*$/m);
    } finally { fs.rmSync(out, { recursive: true, force: true }); }
  });

  test('the header CSP is the page <meta> CSP plus header-only directives', () => {
    const out = assemble('--cloudflare');
    try {
      const header = parse(fs.readFileSync(path.join(out, '_headers'), 'utf8'))['/*']['Content-Security-Policy'];
      for (const page of ['index.html', 'es/index.html', 'it/index.html']) {
        const html = fs.readFileSync(path.join(out, page), 'utf8');
        const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
        for (const directive of meta.split('; ')) expect(header, `${page}: ${directive}`).toContain(directive);
        expect(meta).not.toContain('frame-ancestors'); // invalid inside <meta>
      }
    } finally { fs.rmSync(out, { recursive: true, force: true }); }
  });

  test('staging has the same hardening plus noindex', () => {
    const out = assemble('--staging');
    try {
      const all = parse(fs.readFileSync(path.join(out, '_headers'), 'utf8'))['/*'];
      expect(all['X-Robots-Tag']).toBe('noindex, nofollow');
      expect(all['Strict-Transport-Security']).toBeTruthy();
      expect(all['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    } finally { fs.rmSync(out, { recursive: true, force: true }); }
  });

  test('the GitHub Pages layout never publishes a _headers file', () => {
    const out = assemble();
    try {
      expect(fs.existsSync(path.join(out, '_headers'))).toBe(false);
      expect(fs.existsSync(path.join(out, 'CNAME'))).toBe(true);
    } finally { fs.rmSync(out, { recursive: true, force: true }); }
  });

  test('cannot combine staging and cloudflare layouts', () => {
    expect(() => assemble('--staging', '--cloudflare')).toThrow();
  });
  test('production workflow deploys from inside _site so the staging gate (functions/) is never bundled', () => {
    const wf = fs.readFileSync('.github/workflows/deploy-production.yml', 'utf8');
    const step = wf.split('- name: Deploy to Cloudflare Pages')[1].split('- name:')[0];
    expect(step).toMatch(/working-directory: _site/);
    expect(step).toMatch(/pages deploy \./);
    const out = assemble('--cloudflare');
    try { expect(fs.existsSync(path.join(out, 'functions'))).toBe(false); }
    finally { fs.rmSync(out, { recursive: true, force: true }); }
  });
});
