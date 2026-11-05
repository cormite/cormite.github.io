// Post-deploy check: the live site must send the security headers and must not publish internal files.
//   node scripts/verify-live.mjs https://<your-domain>
// Exits non-zero (and the deploy workflow fails) if anything is missing.
import { REQUIRED_RESPONSE_HEADERS } from './security-headers.mjs';

const base = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https:\/\//.test(base)) {
  console.error('Usage: node scripts/verify-live.mjs https://<host>');
  process.exit(2);
}

const problems = [];
const check = (ok, message) => { if (!ok) problems.push(message); };
const get = (path, init) => fetch(base + path, { redirect: 'manual', ...init });

const home = await get('/');
check(home.status === 200, `GET / returned ${home.status}, expected 200`);
for (const name of REQUIRED_RESPONSE_HEADERS) check(home.headers.has(name), `missing response header: ${name}`);

const h = (n) => (home.headers.get(n) || '').toLowerCase();
check(/max-age=\d{7,}/.test(h('strict-transport-security')), 'HSTS max-age must be at least 1e6 seconds');
check(h('x-content-type-options') === 'nosniff', 'X-Content-Type-Options must be nosniff');
check(h('x-frame-options') === 'deny', 'X-Frame-Options must be DENY');
check(h('cross-origin-opener-policy') === 'same-origin', 'COOP must be same-origin');
const csp = h('content-security-policy');
check(csp.includes("frame-ancestors 'none'"), "CSP must include frame-ancestors 'none'");
check(csp.includes("default-src 'self'") && csp.includes("object-src 'none'"), 'CSP baseline directives missing');
check(!/unsafe-eval/.test(csp) && !/script-src[^;]*unsafe-inline/.test(csp), 'CSP must not allow unsafe-eval or inline scripts');

// Hashed assets must be cached for a year.
const html = await home.text();
const asset = (html.match(/assets\/dist\/[a-z]+\.[0-9a-f]+\.(?:js|css)/) || [])[0];
check(Boolean(asset), 'no hashed bundle referenced by the home page');
if (asset) {
  const a = await get('/' + asset);
  check(a.status === 200, `${asset} returned ${a.status}`);
  check(/immutable/.test(a.headers.get('cache-control') || ''), `${asset} is not served as immutable`);
}

// Internal files must never be published; missing pages must be a real 404.
for (const p of ['/_headers', '/docs/RELEASE.md', '/package.json', '/functions/_middleware.js', '/tests/smoke.spec.mjs', '/scripts/assemble-site.mjs', '/definitely-not-here/']) {
  const r = await get(p);
  check(r.status === 404, `${p} returned ${r.status}, expected 404`);
}
for (const p of ['/es/', '/it/', '/favicon.ico', '/site.webmanifest', '/sitemap.xml']) {
  const r = await get(p);
  check(r.status === 200, `${p} returned ${r.status}, expected 200`);
}

// Machine-readable files: published, plain text, and security.txt still valid (RFC 9116: Contact + a future Expires).
for (const p of ['/llms.txt', '/.well-known/security.txt']) {
  const r = await get(p);
  check(r.status === 200, `${p} returned ${r.status}, expected 200`);
  check(/^text\/plain/i.test(r.headers.get('content-type') || ''), `${p} content-type is "${r.headers.get('content-type')}", expected text/plain`);
}
{
  const r = await get('/.well-known/security.txt');
  if (r.status === 200) {
    const text = await r.text();
    check(/^Contact: mailto:security@/m.test(text), 'security.txt has no Contact: mailto:security@...');
    const expires = (text.match(/^Expires: (.+)$/m) || [])[1];
    check(Boolean(expires) && new Date(expires) > new Date(), `security.txt Expires is missing or in the past (${expires})`);
  }
}

if (problems.length) {
  console.error(`LIVE VERIFICATION FAILED for ${base}:\n - ` + problems.join('\n - '));
  process.exit(1);
}
console.log(`LIVE VERIFICATION PASSED for ${base} (${REQUIRED_RESPONSE_HEADERS.length} security headers, cache and exposure checks)`);
