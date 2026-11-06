// Single source of truth for the Content-Security-Policy and the HTTP response headers.
// - The CSP below is also embedded as a <meta> in every page (build-static-pages.mjs), so it protects the
//   site even where headers cannot be set (GitHub Pages, local preview).
// - On Cloudflare Pages the same policy is sent as a real header (plus the directives a <meta> cannot carry).

export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com",
  "style-src 'self'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
];

// Used in the <meta http-equiv> tag.
export const CSP = CSP_DIRECTIVES.join('; ');

// Header-only directives (ignored or invalid inside a <meta> CSP).
export const CSP_HEADER = [...CSP_DIRECTIVES, "frame-ancestors 'none'", 'upgrade-insecure-requests'].join('; ');

const BASELINE = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none'
};

const block = (pattern, headers) => [pattern, ...Object.entries(headers).map(([k, v]) => `  ${k}: ${v}`), ''].join('\n');

// Cloudflare Pages `_headers` file for PRODUCTION.
// `preloads` lists the render-critical files of the built pages ({ href, as, type?, crossorigin? }); Cloudflare turns
// the Link header into a 103 Early Hints response, so the browser starts fetching them while the server is still
// preparing the page. `/speculation-rules.json` lets Chromium prerender the next page on hover (other browsers ignore it).
export const SPECULATION_RULES_PATH = '/assets/speculation-rules.json';

export function linkHeader(preloads) {
  return preloads.map(({ href, as, type, crossorigin }) =>
    `<${href}>; rel=preload; as=${as}${type ? `; type=${type}` : ''}${crossorigin ? '; crossorigin' : ''}`).join(', ');
}

export function productionHeaders(preloads = []) {
  const longCache = 'public, max-age=31536000, immutable'; // content-hashed files never change
  const page = { 'Speculation-Rules': `"${SPECULATION_RULES_PATH}"`, ...(preloads.length ? { Link: linkHeader(preloads) } : {}) };
  return [
    block('/*', { ...BASELINE, 'Content-Security-Policy': CSP_HEADER }),
    block('/', page),
    block('/es/', page),
    block('/it/', page),
    block(SPECULATION_RULES_PATH, { 'Content-Type': 'application/speculationrules+json', 'Cache-Control': 'public, max-age=3600' }),
    block('/assets/dist/*', { 'Cache-Control': longCache }),
    block('/assets/fonts/*', { 'Cache-Control': 'public, max-age=2592000' }),
    block('/assets/img/*', { 'Cache-Control': 'public, max-age=604800' }),
    block('/assets/icons/*', { 'Cache-Control': 'public, max-age=604800' }),
    block('/assets/og/*', { 'Cache-Control': 'public, max-age=86400' }),
    block('/*.pdf', { 'Cache-Control': 'public, max-age=86400' }),
    block('/favicon.ico', { 'Cache-Control': 'public, max-age=86400' }),
    block('/llms.txt', { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }),
    block('/.well-known/security.txt', { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' })
  ].join('\n');
}

// Cloudflare Pages `_headers` file for the PRIVATE STAGING site (same baseline, never indexed).
export function stagingHeaders() {
  return block('/*', { 'X-Robots-Tag': 'noindex, nofollow', ...BASELINE, 'Content-Security-Policy': CSP_HEADER });
}

export const REQUIRED_RESPONSE_HEADERS = [...Object.keys(BASELINE), 'Content-Security-Policy'];
