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
