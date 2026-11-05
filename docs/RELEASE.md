# Release process

```
feature/* ──PR──▶ test ──auto──▶ STAGING (browser-testable)
                     │
                     └──PR (you approve)──▶ master ──manual workflow + approval──▶ PRODUCTION
```

| Environment | Branch | URL | Trigger |
|---|---|---|---|
| Staging (private) | `test` | https://cormite-staging.pages.dev (password prompt) | automatic on every push to `test` (Cloudflare Pages Git integration) |
| Production | `master` | https://www.cormite.com | **manual only** (`Deploy production` workflow) |

Production is never updated by a push. Two gates apply:
1. Run **Actions → Deploy production → Run workflow** on `master` and type `DEPLOY`.
2. A reviewer must approve the run (GitHub Environment `production` → required reviewers).

## Daily flow
1. Work on `test` (or a branch merged into it). Push.
2. CI runs (reproducible build check + Playwright smoke tests, desktop and mobile).
3. Staging redeploys. Review it in the browser.
4. Happy? Open a PR `test` → `master`, merge it (does **not** publish once Pages source is GitHub Actions).
5. Run **Deploy production**, type `DEPLOY`, approve. Live in about a minute.

## Local
```bash
npm ci
npm run build          # tailwind + static pages (set SOURCE_DATE=<ISO date> for a reproducible build)
npm run serve          # http://localhost:4173
npx playwright install chromium   # one-time
npm test               # Playwright with its own Chromium (same as CI)
```

### Local testing: why not `PW_CHANNEL=chrome`?
`npm run test:local` runs the suite in your installed Google Chrome. On macOS that works, but **Chrome starts
GoogleUpdater, which inherits Playwright's stdout/stderr pipes and keeps running for minutes**, so the runner
sometimes waits long after the last test (root cause verified by inspecting the stuck worker's open sockets).
Use `npm test` with Playwright's own Chromium for normal work; it is hermetic and identical to CI.

### Layout-shift budget
`tests/quality.spec.mjs` measures CLS on a throttled connection. The web fonts have metric-matched Georgia
fallbacks (`assets/css/styles.css`), so the budget is 0.02 where Georgia exists (macOS/iOS/Windows) and the official
"good" limit of 0.1 elsewhere (typically Linux CI). If you change fonts or font sizes, recompute the fallback metrics.

### Contrast
axe cannot judge text over gradients, so `tests/contrast.spec.mjs` measures contrast from rendered pixels for every
visible text element. Small text on dark surfaces uses `--color-accent-on-dark` (`#EFC54F`).

### Regenerating binary assets (outputs are committed)
```bash
npm run build:images                      # responsive AVIF/WebP/JPG from docs/source-assets/new-photo.png
PW_CHANNEL=chrome npm run build:social    # 1200x630 link-preview card
PW_CHANNEL=chrome npm run build:icons     # favicon.ico, PNG icons and site.webmanifest
```

### Dependencies
Dependabot opens weekly PRs against `test`. **Tailwind stays on 3.x on purpose** (4.x changes the CLI, config format and
CSS defaults); Dependabot is configured to skip that major bump. GitHub Actions are pinned to current majors and the CI
runner image is pinned to `ubuntu-24.04` so builds do not change under us.

## One-time setup (cannot be done from code)
**A. Cloudflare Pages (private staging)** - no tokens or secrets are stored in GitHub.
1. Free account at https://dash.cloudflare.com/sign-up.
2. Workers & Pages -> Create -> Pages -> **Connect to Git** -> authorise the Cloudflare GitHub app for **only** `cormite/cormite.github.io` -> select it.
3. Project name `cormite-staging`. **Production branch: `test`**. Framework preset: None.
   Build command: `node scripts/assemble-site.mjs --staging --out _site` Build output directory: `_site`.
   Environment variable: `NODE_VERSION` = `22`. Save and deploy.
4. Password gate (free, no payment details): `functions/_middleware.js` asks for a password on every request and **fails closed** (503) if no password is set. Generate one and copy it to the clipboard without printing it, then store it in your password manager:
   `openssl rand -base64 24 | tr -d '\n' | pbcopy`
   Cloudflare -> Workers & Pages -> `cormite-staging` -> Settings -> Variables and Secrets -> Add -> type **Secret**, name `STAGING_PASSWORD`, paste the value, for **both Production and Preview**. Then Deployments -> Retry (or push). Rotate the password any time by changing the secret.
   Cloudflare Access (SSO/MFA) is the stronger alternative but requires payment details even on the free plan, so it is intentionally not used.

**B. GitHub** (order matters: merging into `master` publishes immediately while Pages still deploys from the branch, so switch Pages to Actions BEFORE the first merge)
1. Settings -> Environments -> New environment `production`: Required reviewers = you; Deployment branches = Selected branches -> `master`.
2. Settings -> Branches -> Add rule for `master`: require a pull request, require status check `verify`, block force-push and deletion.
3. Settings -> Pages -> Source = **GitHub Actions** (keep custom domain `www.cormite.com`, Enforce HTTPS). The already-published site keeps being served; pushes to `master` no longer publish.
4. Open a pull request `test` -> `master` and merge it (publishes nothing).
5. Actions -> **Deploy production** -> Run workflow on `master` -> type `DEPLOY` -> approve the run.

`scripts/assemble-site.mjs` is shared by staging and production: it copies an explicit allowlist of files (never the whole repo), and fails if any file referenced by the pages is missing.

## Production on Cloudflare Pages (real security headers) - LIVE since 2026-11-05
GitHub Pages cannot send HTTP response headers, so the live site has no HSTS, clickjacking protection, Referrer/Permissions
policy or CSP *header* (the CSP `<meta>` still applies). Cloudflare Pages can, and it also allows one-year immutable caching
for the content-hashed bundles. The same `Deploy production` workflow (DEPLOY + reviewer approval) publishes to either target,
chosen by the repository variable `PRODUCTION_TARGET` (`github-pages` default, or `cloudflare`).

What ships: `scripts/security-headers.mjs` generates `_headers` (`assemble-site.mjs --cloudflare`); after every deploy
`scripts/verify-live.mjs` fails the run if any header, cache rule or exposure check is wrong.

**One-time setup** (needs your Cloudflare and GitHub accounts):
1. Cloudflare: My Profile -> API Tokens -> Create Token -> Custom token. Permission: **Account -> Cloudflare Pages -> Edit** only.
   Name it `github-deploy-production`. Copy the token (shown once). Copy your **Account ID** (Workers & Pages overview).
2. Create the project (your terminal; the token stays in your shell, nothing is written to disk):
   `CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<id> npx wrangler@4.157.0 pages project create cormite-production --production-branch main`
3. GitHub -> Settings -> Environments -> `production` -> add secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. GitHub -> Settings -> Secrets and variables -> Actions -> Variables: `PRODUCTION_TARGET` = `cloudflare`,
   `PRODUCTION_URL` = `https://cormite-production.pages.dev` (temporary, until step 6).

**State and lessons from the cutover (2026-11-05):**
- Production is `cormite-production` on Cloudflare Pages, domain `www.cormite.com`; variables `PRODUCTION_TARGET=cloudflare`, `PRODUCTION_URL=https://www.cormite.com`.
- `wrangler pages deploy` bundles `./functions` from its working directory. The workflow therefore deploys from inside `_site`; from the repo root it shipped the staging password gate (503 everywhere). `tests/headers.spec.mjs` guards this.
- Cloudflare's zone-level HSTS setting (SSL/TLS -> Edge Certificates) overrides the origin header. It is set to 12 months, include-subdomains off, preload off (a leftover `max-age=0` disabled HSTS). It also applies to the other proxied subdomains of the zone.
- The apex A/AAAA records still point at GitHub Pages IPs (proxied); they are never reached because the apex redirect rule answers first. Leave them.
- Verify at any time: `node scripts/verify-live.mjs https://www.cormite.com`.

**Cloudflare zone configuration (audited and set 2026-11-05, free plan):**
- DNS (6 records): proxied `AAAA @ 100::` (placeholder so the apex redirect runs), proxied `www` CNAME -> `cormite-production.pages.dev`,
  SPF `v=spf1 -all`, DMARC `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s`, null MX `0 .`, Google Search Console verification TXT.
  The domain deliberately sends and receives no mail. If mail is ever needed, replace SPF/DMARC/MX first.
- Apex: Redirect Rule "Apex to www" (`http.host eq "cormite.com"` -> `concat("https://www.cormite.com", http.request.uri.path)`, 301, preserve query string).
  No Page Rules remain.
- SSL/TLS: Full (strict), Always Use HTTPS on, minimum TLS 1.2, TLS 1.3 on, HSTS 12 months (no subdomains, no preload), Automatic HTTPS Rewrites on.
- Speed: HTTP/2 and HTTP/3 on, Early Hints on. Deliberately OFF: Rocket Loader, Auto Minify, Cloudflare Fonts, Speed Brain, Real User Monitoring
  and "Enable all available settings" (they inject scripts or rewrite assets and conflict with the strict CSP and consent model). Bot Fight Mode and CAA records were left off on purpose.
- DNSSEC: on. DS (key tag 2371, algorithm 13, digest type 2) is registered at the registrar (DonDominio). If Cloudflare ever re-keys, update the DS there.
- Registrar: DonDominio; domain expires 2027-04-13 (check auto-renew).

**Rehearsal (no visitor impact):** run Deploy production. It publishes to `cormite-production.pages.dev`, verifies headers there, and
the real site is untouched. Open that URL and check it.

**Cutover:**
5. Cloudflare -> DNS -> delete the `www` CNAME (-> `cormite.github.io`).
6. Cloudflare -> Workers & Pages -> `cormite-production` -> Custom domains -> add `www.cormite.com` (Cloudflare creates the record and the certificate).
7. Set the variable `PRODUCTION_URL` = `https://www.cormite.com`, re-run Deploy production, confirm it verifies on the real domain.
8. GitHub -> Settings -> Pages: **keep** the custom domain. DNS no longer points at GitHub, but while it is set `https://cormite.github.io/` answers `301 -> https://www.cormite.com/` (removing it would expose a stale duplicate copy of the site) and the 2-minute rollback stays ready.
The apex redirect rule (`cormite.com` -> `www`) is unchanged.

**Rollback (about 2 minutes):** Cloudflare DNS: point `www` CNAME back to `cormite.github.io` and re-add the GitHub Pages custom domain;
set `PRODUCTION_TARGET` = `github-pages`; re-run Deploy production.

HSTS is sent with `includeSubDomains` on `www.cormite.com` only (it covers `*.www.cormite.com`, nothing else), so your other
subdomains (mail, bastion, ...) are not affected. Preload is deliberately not enabled.

## Rollback
Re-run **Deploy production** after `git revert` on `master`, or run it on an earlier commit via a `hotfix/*` PR into `master`.

## Build architecture (what `npm run build` does)
1. `build:css` – Tailwind scans the page template, build script, pages and JS, and emits `assets/css/tailwind.css`.
2. `build:pages` – bundles + minifies JS/CSS into **hashed files in `assets/dist/`** (esbuild), runs the real renderer (`assets/js/site-render.js`) inside jsdom to pre-render EN/ES/IT pages, converts icons to inline SVG, splits the hero name for the kinetic reveal, injects CSP, preloads and responsive `<picture>` markup, and writes `sitemap.xml`.
3. The browser does **not** re-render: pages carry `data-prerendered="true"`. Source of truth for content is `assets/js/site-content.js`.
4. Output is committed; CI rebuilds and fails if the committed output is stale.

Regenerate binary assets only when needed (outputs are committed):
```bash
npm run build:images                       # responsive AVIF/WebP/JPG from docs/source-assets/new-photo.png
PW_CHANNEL=chrome npm run build:social     # 1200x630 link-preview card -> assets/og/og-card.jpg
```

## Privacy and security notes
- Google Analytics 4 loads **only after the visitor accepts** (Consent Mode v2 defaults to denied; ads signals off). Choice stored in `localStorage` (`cormite-consent-v1`); footer button "Privacy settings" reopens it.
- CSP is delivered via `<meta>` (GitHub Pages cannot set headers). A meta CSP cannot enforce `frame-ancestors`, `X-Frame-Options`, HSTS or `Permissions-Policy`. For those, put Cloudflare (free) in front of the domain and add response headers there.
- Inline `style` attributes are allowed (`style-src-attr`) because the markup uses them for animation delays; scripts are strictly same-origin plus googletagmanager.com.
- Dependabot opens weekly dependency PRs against `test`.

## Accessibility and motion
- `tests/a11y.spec.mjs` runs axe (WCAG 2.1 A/AA + best practice) on all three pages, with the consent banner open and closed, desktop and mobile. Serious/critical violations fail CI.
- All motion (constellation canvas, spotlight, tilt, kinetic name, counters, reveal) is disabled or settled under `prefers-reduced-motion` and data-saver. Without JavaScript everything stays visible.
- axe cannot measure text over gradients; gold-on-dark contrast was verified by calculation and fixed with `--color-accent-on-dark`.
