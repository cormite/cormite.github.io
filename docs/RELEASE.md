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

## Primary domain: carlosfernandezsanmillan.com (2026-11-05)

The professional identity moved to **https://carlosfernandezsanmillan.com** (bare apex). The domain is a single setting, `SITE_ORIGIN` in `assets/js/site-content.js`; CNAME, robots.txt, sitemap, canonical/hreflang/Open Graph, JSON-LD and the social card all follow it.

Cloudflare state (zone `carlosfernandezsanmillan.com`, same account):
- Pages project `cormite-production` serves both `carlosfernandezsanmillan.com` and `www.` (custom domains).
- Redirect Rule "www to apex": `www` -> apex, 301, path and query preserved.
- DNSSEC on (DS at DonDominio, digest verified against the published KSK, validated by 1.1.1.1/8.8.8.8/9.9.9.9).
- Email Routing, receive-only: `hello@` (public), `carlos@`, `security@` forward to the owner's private mailbox; catch-all off. SPF `include:_spf.mx.cloudflare.net -all`, DMARC `p=reject; sp=reject; adkim=s; aspf=s`. Verified end to end from an outside account.
- Corporate senders may hold mail to a newly registered domain for a while (observed from one corporate account); not a configuration fault.

Cutover order (the owner runs every step; nothing here is automatic):
1. Merge `test` -> `master` (publishes nothing).
2. Set repository variable `PRODUCTION_URL` = `https://carlosfernandezsanmillan.com` BEFORE deploying, so `verify-live` checks the new host.
3. Run `Deploy production` (DEPLOY + reviewer approval).
4. Only after the new domain is live and verified: on the `cormite.com` zone, change the "Apex to www" Redirect Rule so `cormite.com` and `www.cormite.com` 301 to `https://carlosfernandezsanmillan.com` + path + query, and detach `www.cormite.com` from the Pages project (or keep it; the rule runs first).
5. Search Console: add `carlosfernandezsanmillan.com` as a Domain property, then use Change of Address from the old property.

Rollback: re-point the `cormite.com` redirect back and revert `SITE_ORIGIN` through the normal gated flow; GitHub Pages remains the 2-minute rollback for the site itself.

## Release 2 features (built 2026-11-05)

- **Command menu** (`assets/js/site-palette.js`): Cmd/Ctrl+K, `/` (outside form fields) or the search button in the navigation. A native `<dialog>` (focus trap, Esc and focus restore from the platform), built lazily on first open, EN/ES/IT strings in `site-content.js` (`paletteXxx`). Lists sections, language switch, CV, email, LinkedIn and GitHub; every item also exists as a normal link on the page. One consent-gated analytics event, `palette_open`. The visible shortcut hint is CSS-generated content and the shortcut is part of the button's accessible name (axe `label-content-name-mismatch`).
- **"Now" line**: live Milan time (`Intl`, `Europe/Rome`) after the location in the hero chip. Client-side only; the pre-rendered HTML contains an empty, width-reserved `#hero-time`, which keeps the build reproducible.
- **`/llms.txt`** and **`/.well-known/security.txt`**: generated by `scripts/build-static-pages.mjs` from the same content and committed like the sitemap. Served as `text/plain; charset=utf-8` (rules in `scripts/security-headers.mjs`), checked by `verify-live`. Not published on staging. The GitHub Pages rollback layout adds `.nojekyll` so the dot-folder is served. wrangler 4.157.0 uploads `.well-known` (its Pages ignore list is `_worker.js`, `_redirects`, `_headers`, `_routes.json`, `functions`, `.DS_Store`, `node_modules`, `.git`, `.wrangler`).
- **security.txt renewal**: `Expires` is the build date plus one year, so every release renews it. `tests/discoverability.spec.mjs` fails when fewer than 30 days remain; the fix is to run `npm run build`, commit and release.
- Bundle growth: about 2.3 KB gzip of JavaScript (budget 10 KB).

## Uptime alert (`.github/workflows/uptime.yml`)

Every 30 minutes (minutes 17 and 47) GitHub runs `scripts/uptime-check.mjs` against production. It checks, with one retry after 20 s so a single blip does not alert:
the site and its security headers (`verify-live`), `www` and the legacy `cormite.com` / `www.cormite.com` 301 redirects (path and query kept), the TLS certificate (at least 14 days left), e-mail routing (the three Cloudflare MX records), and `security.txt` (at least 14 days left, so it doubles as the renewal reminder).

- **Alert:** a failed run e-mails the people who watch Actions failures (by default the author of the last change to the workflow file). Check *GitHub > Settings > Notifications > Actions* keeps failed-workflow e-mail on. To run it now: *Actions > Uptime > Run workflow*.
- **Free and card-free:** no external service. Scheduled workflows run from `master`, so it starts after the first merge.
- **Gotcha:** GitHub pauses scheduled workflows in a repository with no activity for 60 days; any push re-enables them (the page is released often enough, and a paused schedule shows a banner on the Actions page).
- The same script is runnable by hand: `node scripts/uptime-check.mjs`.

## Performance budget (`tests/performance.spec.mjs`, part of `npm test` and therefore of CI)

Deterministic limits for the first visit of each language page (consent denied), measured as a CDN sends it (gzip for text, raw for fonts and images). Current: 9 requests, about 152 KB.

| Limit | Value | Today |
|---|---|---|
| Requests | 12 | 9 |
| Total | 200 KB | 152 KB |
| HTML | 18 KB | 13.5 KB |
| JavaScript | 30 KB | 23.5 KB |
| CSS | 11 KB | 7.7 KB |
| Fonts | 110 KB (4 files) | 91 KB (4 files) |
| Images | 25 KB | 15.7 KB |

Also enforced: one stylesheet, no render-blocking script, hero image `fetchpriority=high` and not lazy, content-hashed bundle names, and no request to any other host before analytics consent. Timing metrics (LCP, CLS) are not asserted here because they depend on the machine; CLS has its own test in `tests/quality.spec.mjs`. A limit may be raised only on purpose, in a commit that says why.

## CI speed: parallel test groups (`.github/workflows/ci.yml`, `deploy-production.yml`)

The suite needs about 400 s of single-core work, and a GitHub runner runs two tests at a time, so one job took 3.5-4 minutes. It now runs as parallel jobs:

| Job | What | Notes |
|---|---|---|
| `static` | reproducible build, deploy layouts, dependency audit | no browser, about 20 s |
| `tests (contrast-desktop)`, `tests (contrast-mobile)` | the pixel-measured contrast checks, one project each | the slowest file, split by project |
| `tests (quality)`, `tests (ui)`, `tests (media)` | quality / palette + a11y / portrait, transitions, performance, mobile menu | hand-balanced groups |
| `tests (rest)` | every spec file not named in a group (smoke, headers, domain, ...) | automatic: a new spec file can never be skipped |
| `verify` | passes only when `static` and every test group passed | **keep this job name: the branch-protection rule requires a check called `verify`** |

- Groups live in `GROUPS` in `playwright.config.mjs` (selected by the `TEST_GROUP` environment variable; without it, a local `npm test` runs everything). Groups were balanced by measured time (20-34 s each on a 2-worker run).
- Files that do not depend on the viewport (headers, domain, discoverability, uptime, staging gate, explicit-size tests) run once in the `once` project instead of once per viewport: 262 tests instead of 298 with the same coverage. Tests inside a file run in parallel (`fullyParallel`).
- Shared setup (Node, npm cache, Playwright Chromium cached by version, OS libraries) is the composite action `.github/actions/prepare`.
- `tests/ci-config.spec.mjs` guards the wiring: a job named `verify` that needs `static` and `tests`, every matrix group exists in the config, the `rest` group runs, and no spec file is in two groups.
- Adding a slow spec file: it lands in `rest` automatically; if `rest` becomes the slowest job, move the file into a named group in `GROUPS` and add that group to the matrix in both workflows.
- Deploy production runs the same verification on `master` before anything is published; because the groups run side by side that gate is also about twice as fast.
