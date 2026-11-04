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
export function productionHeaders() {
  const longCache = 'public, max-age=31536000, immutable'; // content-hashed files never change
  return [
    block('/*', { ...BASELINE, 'Content-Security-Policy': CSP_HEADER }),
    block('/assets/dist/*', { 'Cache-Control': longCache }),
    block('/assets/fonts/*', { 'Cache-Control': 'public, max-age=2592000' }),
    block('/assets/img/*', { 'Cache-Control': 'public, max-age=604800' }),
    block('/assets/icons/*', { 'Cache-Control': 'public, max-age=604800' }),
    block('/assets/og/*', { 'Cache-Control': 'public, max-age=86400' }),
    block('/*.pdf', { 'Cache-Control': 'public, max-age=86400' }),
    block('/favicon.ico', { 'Cache-Control': 'public, max-age=86400' })
  ].join('\n');
}

// Cloudflare Pages `_headers` file for the PRIVATE STAGING site (same baseline, never indexed).
export function stagingHeaders() {
  return block('/*', { 'X-Robots-Tag': 'noindex, nofollow', ...BASELINE, 'Content-Security-Policy': CSP_HEADER });
}

export const REQUIRED_RESPONSE_HEADERS = [...Object.keys(BASELINE), 'Content-Security-Policy'];
