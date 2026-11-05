# carlosfernandezsanmillan.com

Personal website of Carlos Fernández San Millán: <https://carlosfernandezsanmillan.com>.
Static site (EN / ES / IT), hosted on Cloudflare Pages (real security headers, DNSSEC), built to look and feel executive and to be fast, private and accessible.

| | |
|---|---|
| **Production** | `master` → <https://carlosfernandezsanmillan.com> (published only by the manual **Deploy production** workflow; Cloudflare Pages; GitHub Pages remains the 2-minute rollback target, see [docs/RELEASE.md](docs/RELEASE.md)) |
| **Staging (private)** | `test` → Cloudflare Pages, password protected |
| **Stack** | Tailwind 3 (pinned on purpose), vanilla JS, esbuild, jsdom build-time rendering, Playwright + axe tests |

## How it works
- Content lives in `assets/js/site-content.js` (three languages). `npm run build` renders the three pages at build time
  with the same renderer the browser used to run, bundles JS/CSS into hashed files in `assets/dist/`, injects CSP,
  preloads, responsive images and icons, and writes the sitemap and a branded 404.
- The browser does not re-render: pages ship with `data-prerendered="true"`.
- Analytics (Google Analytics 4) loads **only after the visitor opts in** (Consent Mode v2).

## Everyday commands
```bash
npm ci                 # install
npm run build          # rebuild pages, CSS and bundles (commit the output)
npm run serve          # preview at http://localhost:4173  (do NOT open index.html as a file)
npm test               # full Playwright + axe + contrast suite (uses Playwright's own Chromium)
```
One-time, for `npm test`: `npx playwright install chromium`. See [docs/RELEASE.md](docs/RELEASE.md) for the release
process, local-testing notes and one-time GitHub/Cloudflare setup.

## Rules of the road
1. Work on `test` (or a branch merged into it). CI must be green.
2. Review staging, open a pull request `test` → `master`, merge it (this publishes nothing).
3. Publish with **Actions → Deploy production** (type `DEPLOY`, then approve). Nothing else touches production.

Content, text, photographs and the CV are © Carlos Fernández San Millán. All rights reserved.
