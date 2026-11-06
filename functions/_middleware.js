// Cloudflare Pages Function: password gate for the PRIVATE STAGING site.
// Runs in front of every request (pages, assets, previews). Fails CLOSED: if STAGING_PASSWORD
// is not configured, nothing is served. The password lives only in Cloudflare (encrypted secret),
// never in this repository. Free tier, no payment details required.
// Not deployed to production: GitHub Pages uses scripts/assemble-site.mjs (allowlist), which excludes /functions.

const encoder = new TextEncoder();

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

// Constant-time comparison of two SHA-256 digests (avoids leaking length/prefix via timing).
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i += 1) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

function challenge(status, message) {
  return new Response(message, {
    status,
    headers: {
      'WWW-Authenticate': 'Basic realm="Staging", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}

export async function onRequest(context) {
  const { request, env, next } = context;

  if (!env.STAGING_PASSWORD) {
    return new Response('Staging is locked: STAGING_PASSWORD is not configured.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }
    });
  }

  const header = request.headers.get('Authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    // Basic credentials are bytes: decode them as UTF-8 (atob alone yields Latin-1 characters, so any password with an
    // accent or symbol outside ASCII could never match).
    try { decoded = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))); } catch { /* malformed header: fall through to challenge */ }
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (decoded.includes(':') && await safeEqual(password, env.STAGING_PASSWORD)) {
      const response = await next();
      const guarded = new Response(response.body, response);
      guarded.headers.set('Cache-Control', 'private, no-store');
      return guarded;
    }
  }
  return challenge(401, 'Authentication required.');
}
