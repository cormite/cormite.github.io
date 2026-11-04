// Assembles the deployable site into an output folder using an ALLOWLIST (nothing is published by accident).
//   node scripts/assemble-site.mjs                 -> production layout in ./_site
//   node scripts/assemble-site.mjs --staging       -> private-staging layout (noindex, headers, no sitemap/CNAME)
//   node scripts/assemble-site.mjs --out <dir>
// It also verifies that every local file referenced by the built pages exists in the output.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const staging = args.includes('--staging');
const outIdx = args.indexOf('--out');
const out = path.resolve(root, outIdx >= 0 ? args[outIdx + 1] : '_site');

const ALLOW = [
  'index.html', '404.html', 'es', 'it',
  'assets/dist', 'assets/fonts', 'assets/img', 'assets/og', 'assets/icons', 'site.webmanifest',
  'photo.jpg', 'favicon.ico', 'robots.txt',
  'carlos-fernandez-san-millan-en.pdf', 'carlos-fernandez-san-millan-es.pdf', 'carlos-fernandez-san-millan-it.pdf'
];
if (!staging) ALLOW.push('sitemap.xml', 'CNAME');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const item of ALLOW) {
  const src = path.join(root, item);
  if (!fs.existsSync(src)) throw new Error(`Missing required file: ${item}`);
  fs.cpSync(src, path.join(out, item), { recursive: true });
}

if (staging) {
  for (const page of ['index.html', 'es/index.html', 'it/index.html']) {
    const file = path.join(out, page);
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('<head>')) throw new Error(`No <head> in ${page}`);
    // Replace the existing robots meta (don't add a conflicting second one).
    const next = /<meta name="robots"[^>]*>/.test(html)
      ? html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,nofollow">')
      : html.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">');
    fs.writeFileSync(file, next);
  }
  fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  fs.writeFileSync(path.join(out, '_headers'), [
    '/*',
    '  X-Robots-Tag: noindex, nofollow',
    '  X-Frame-Options: DENY',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()',
    '  Strict-Transport-Security: max-age=31536000; includeSubDomains',
    ''
  ].join('\n'));
  fs.writeFileSync(path.join(out, 'BUILD.txt'), `Staging build ${process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || 'local'} ${new Date().toISOString()}\n`);
}

// Verify every local reference in the pages resolves to a file in the output.
const missing = [];
for (const page of ['index.html', 'es/index.html', 'it/index.html']) {
  const html = fs.readFileSync(path.join(out, page), 'utf8');
  const dir = path.dirname(path.join(out, page));
  const refs = [...html.matchAll(/(?:src|href|srcset|imagesrcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0]));
  for (const ref of refs) {
    if (!ref || /^(https?:|mailto:|data:|#|\/\/)/.test(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = clean.startsWith('/') ? path.join(out, clean) : path.join(dir, clean);
    const resolved = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
    if (!fs.existsSync(resolved)) missing.push(`${page} -> ${ref}`);
  }
}
if (missing.length) {
  console.error('Referenced files missing from the output:\n  ' + [...new Set(missing)].join('\n  '));
  process.exit(1);
}
console.log(`Assembled ${staging ? 'STAGING' : 'PRODUCTION'} site in ${path.relative(root, out) || '.'} (${ALLOW.length} entries, all references resolve)`);
