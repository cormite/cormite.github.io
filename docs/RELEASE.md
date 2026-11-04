# Release process

```
feature/* ──PR──▶ test ──auto──▶ STAGING (browser-testable)
                     │
                     └──PR (you approve)──▶ master ──manual workflow + approval──▶ PRODUCTION
```

| Environment | Branch | URL | Trigger |
|---|---|---|---|
| Staging (private) | `test` | https://cormite-staging.pages.dev (Cloudflare Access login) | automatic on every push to `test` (Cloudflare Pages Git integration) |
| Production | `master` | https://www.cormite.com | **manual only** (`Deploy production` workflow) |

Production is never updated by a push. Two gates apply:
1. Run **Actions → Deploy production → Run workflow** on `master` and type `DEPLOY`.
2. A reviewer must approve the run (GitHub Environment `production` → required reviewers).

## Daily flow
1. Work on `test` (or a branch merged into it). Push.
2. CI runs (reproducible build check + Playwright smoke tests, desktop and mobile).
3. Staging redeploys. Review it in the browser.
4. Happy? Open a PR `test` → `master`, merge it (does **not** publish).
5. Run **Deploy production**, type `DEPLOY`, approve. Live in about a minute.

## Local
```bash
npm ci
npm run build          # tailwind + static pages (set SOURCE_DATE=<ISO date> for a reproducible build)
npm run serve          # http://localhost:4173
npm run test:local     # Playwright using installed Google Chrome
npm test               # Playwright with bundled Chromium (CI)
```

## One-time setup (cannot be done from code)
**A. Cloudflare Pages (private staging)** - no tokens or secrets are stored in GitHub.
1. Free account at https://dash.cloudflare.com/sign-up.
2. Workers & Pages -> Create -> Pages -> **Connect to Git** -> authorise the Cloudflare GitHub app for **only** `cormite/cormite.github.io` -> select it.
3. Project name `cormite-staging`. **Production branch: `test`**. Framework preset: None.
   Build command: `node scripts/assemble-site.mjs --staging --out _site` Build output directory: `_site`.
   Environment variable: `NODE_VERSION` = `22`. Save and deploy.
4. Zero Trust -> Access -> Applications -> Add -> Self-hosted. Domains: `cormite-staging.pages.dev` and `*.cormite-staging.pages.dev`. Policy: Allow -> Emails -> your address. Login method: One-time PIN.

**B. GitHub**
1. Settings -> Environments: create `production` (Required reviewers = you; Deployment branches = `master` only).
2. Settings -> Branches: protect `master` (require PR, require status check `verify`, block force-push/deletion).
3. Last, after staging works: Settings -> Pages -> Source = **GitHub Actions** (keep custom domain `www.cormite.com`, Enforce HTTPS).

> Switching Pages to "GitHub Actions" means a push to `master` no longer publishes. Do it only after staging has been verified.

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
