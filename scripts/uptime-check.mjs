// Scheduled production health check (run by .github/workflows/uptime.yml every 30 minutes; also runnable by hand).
//   node scripts/uptime-check.mjs
// Beyond "is it up", it proves the things that would silently break the professional identity:
//   the site and its security headers, the www and legacy-domain redirects, the TLS certificate, e-mail routing (MX),
//   and that security.txt has not lapsed. Any failure exits non-zero, which makes GitHub e-mail the workflow owner.
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';
import vm from 'node:vm';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/site-content.js'), 'utf8'), sandbox, { filename: 'site-content.js' });
const configured = sandbox.__SITE_CONTENT.SITE_CONFIG;
// UPTIME_SITE_URL exists only so the tests can prove the check really fails when the site is unreachable.
const siteUrl = process.env.UPTIME_SITE_URL || configured.siteUrl;
const siteHost = new URL(siteUrl).hostname;

// Previous domain: kept as a permanent redirect to the primary one (see docs/RELEASE.md).
const LEGACY_HOSTS = ['cormite.com', 'www.cormite.com'];
const MIN_CERT_DAYS = 14;
const MIN_SECURITY_TXT_DAYS = 14;
const DAY = 24 * 3600 * 1000;

const redirectOf = async (url) => {
  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  return { status: res.status, location: res.headers.get('location') || '' };
};

const checks = [
  ['site and security headers (verify-live)', async () => {
    const run = spawnSync(process.execPath, [path.join(root, 'scripts/verify-live.mjs'), siteUrl], { encoding: 'utf8', timeout: 90000 });
    if (run.status !== 0) throw new Error((run.stderr || run.stdout || 'verify-live failed').trim());
  }],
  ['www redirects to the apex (301, path and query kept)', async () => {
    const { status, location } = await redirectOf(`https://www.${siteHost}/es/?utm_source=uptime`);
    if (status !== 301 || location !== `${siteUrl}/es/?utm_source=uptime`) throw new Error(`got ${status} ${location}`);
  }],
  ...LEGACY_HOSTS.map((host) => [`${host} redirects to the primary domain (301)`, async () => {
    const { status, location } = await redirectOf(`https://${host}/it/?utm_source=uptime`);
    if (status !== 301 || location !== `${siteUrl}/it/?utm_source=uptime`) throw new Error(`got ${status} ${location}`);
  }]),
  [`TLS certificate valid for at least ${MIN_CERT_DAYS} more days`, () => new Promise((resolve, reject) => {
    const socket = tls.connect({ host: siteHost, port: 443, servername: siteHost, timeout: 15000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      const days = (new Date(cert.valid_to).getTime() - Date.now()) / DAY;
      if (!socket.authorized) reject(new Error(`certificate not trusted: ${socket.authorizationError}`));
      else if (days < MIN_CERT_DAYS) reject(new Error(`certificate expires in ${days.toFixed(1)} days`));
      else resolve();
    });
    socket.on('timeout', () => { socket.destroy(); reject(new Error('TLS timeout')); });
    socket.on('error', reject);
  })],
  ['e-mail routing: MX records point to Cloudflare Email Routing', async () => {
    const records = await dns.resolveMx(siteHost);
    const names = records.map((r) => r.exchange.toLowerCase());
    for (const n of ['route1', 'route2', 'route3']) {
      if (!names.includes(`${n}.mx.cloudflare.net`)) throw new Error(`missing ${n}.mx.cloudflare.net (found: ${names.join(', ') || 'none'})`);
    }
  }],
  [`security.txt valid for at least ${MIN_SECURITY_TXT_DAYS} more days`, async () => {
    const res = await fetch(`${siteUrl}/.well-known/security.txt`, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    const expires = (text.match(/^Expires: (.+)$/m) || [])[1];
    const days = expires ? (new Date(expires).getTime() - Date.now()) / DAY : NaN;
    if (!(days >= MIN_SECURITY_TXT_DAYS)) throw new Error(`Expires ${expires}: release the site to renew it`);
  }]
];

// One retry after a pause: a single blip at the edge must not wake anyone up, a real outage fails both attempts.
const attempt = async (fn) => {
  try { await fn(); return null; } catch (first) {
    await new Promise((r) => setTimeout(r, Number(process.env.UPTIME_RETRY_MS ?? 20000)));
    try { await fn(); return null; } catch (second) { return second; }
  }
};

const failures = [];
for (const [name, fn] of checks) {
  const error = await attempt(fn);
  console.log(`${error ? 'FAIL' : 'ok  '} ${name}${error ? `\n     ${String(error.message || error).split('\n').join('\n     ')}` : ''}`);
  if (error) failures.push(name);
}
if (failures.length) {
  console.error(`\nUPTIME CHECK FAILED for ${siteUrl}: ${failures.length} of ${checks.length} checks failed`);
  process.exit(1);
}
console.log(`\nUptime check passed for ${siteUrl} (${checks.length} checks)`);
